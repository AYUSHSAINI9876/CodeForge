const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otpModel");
const { sendOtpEmail } = require("./mailer");

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 45;
const CHALLENGE_TTL = "15m";

function generateCode() {
  // crypto.randomInt is uniform — Math.random is not, and this gates account access.
  return String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

function signChallengeToken(otpId, userId) {
  return jwt.sign(
    { otpId: otpId.toString(), id: userId.toString(), typ: "otp_challenge" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: CHALLENGE_TTL }
  );
}

function verifyChallengeToken(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (decoded.typ !== "otp_challenge") {
    throw new Error("Wrong token type");
  }
  return decoded;
}

async function issueOtp(user) {
  const recent = await Otp.findOne({ user: user._id, consumedAt: null }).sort({ createdAt: -1 });
  if (recent) {
    const secondsSince = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      const error = new Error("Please wait before requesting another code.");
      error.code = "COOLDOWN";
      error.retryAfter = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince);
      throw error;
    }
  }

  // Any earlier pending code becomes void as soon as a new one is issued.
  await Otp.updateMany({ user: user._id, consumedAt: null }, { $set: { consumedAt: new Date() } });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const otp = await Otp.create({
    user: user._id,
    codeHash,
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });

  const result = await sendOtpEmail({
    to: user.email,
    username: user.username,
    code,
    expiryMinutes: OTP_TTL_MINUTES,
  });

  return {
    challengeToken: signChallengeToken(otp._id, user._id),
    expiresInMinutes: OTP_TTL_MINUTES,
    resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
    devFallback: result.devFallback,
  };
}

async function verifyOtp(challengeToken, code) {
  let decoded;
  try {
    decoded = verifyChallengeToken(challengeToken);
  } catch (err) {
    const error = new Error("This sign-in session expired. Please start again.");
    error.code = "INVALID_CHALLENGE";
    throw error;
  }

  const otp = await Otp.findById(decoded.otpId);
  if (!otp || otp.consumedAt || otp.expiresAt < new Date()) {
    const error = new Error("This code has expired. Please request a new one.");
    error.code = "EXPIRED";
    throw error;
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    const error = new Error("Too many incorrect attempts. Please request a new code.");
    error.code = "LOCKED";
    throw error;
  }

  const matches = await bcrypt.compare(String(code), otp.codeHash);
  if (!matches) {
    otp.attempts += 1;
    await otp.save();
    const error = new Error("That code isn't right. Please try again.");
    error.code = "MISMATCH";
    error.attemptsLeft = Math.max(MAX_ATTEMPTS - otp.attempts, 0);
    throw error;
  }

  otp.consumedAt = new Date();
  await otp.save();

  return { userId: decoded.id };
}

module.exports = {
  issueOtp,
  verifyOtp,
  verifyChallengeToken,
  OTP_TTL_MINUTES,
  RESEND_COOLDOWN_SECONDS,
};
