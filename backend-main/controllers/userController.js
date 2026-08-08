const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const { issueOtp, verifyOtp, verifyChallengeToken } = require("../services/otpService");

const TOKEN_EXPIRY = "7d";
const PUBLIC_PROFILE_FIELDS = "username email bio location website createdAt";

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: TOKEN_EXPIRY,
  });
}

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function signup(req, res) {
  const { username, password, email } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email and password are all required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: "A user with that email or username already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashedPassword });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      userId: user._id,
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Error during signup : ", err.message);
    res.status(500).json({ message: "Server error" });
  }
}

function maskEmail(email) {
  const [name, domain] = String(email).split("@");
  if (!domain) return "your email";
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"•".repeat(Math.max(name.length - visible.length, 1))}@${domain}`;
}

// Step 1 of login: verify the password, then email a one-time code. No session
// token is issued here — only a short-lived challenge that step 2 exchanges.
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const challenge = await issueOtp(user);

    res.json({
      otpRequired: true,
      challengeToken: challenge.challengeToken,
      maskedEmail: maskEmail(user.email),
      expiresInMinutes: challenge.expiresInMinutes,
      resendAfterSeconds: challenge.resendAfterSeconds,
      devFallback: challenge.devFallback,
    });
  } catch (err) {
    if (err.code === "COOLDOWN") {
      return res.status(429).json({ message: err.message, retryAfter: err.retryAfter });
    }
    console.error("Error during login : ", err.message);
    res.status(500).json({ message: "Could not start sign-in. Please try again." });
  }
}

// Step 2 of login: exchange a valid code for a real session token.
async function verifyLoginOtp(req, res) {
  const { challengeToken, code } = req.body;

  if (!challengeToken || !code) {
    return res.status(400).json({ message: "Verification code is required." });
  }

  try {
    const { userId } = await verifyOtp(challengeToken, code);
    const user = await User.findById(userId).select("username email");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const token = signToken(user._id);
    res.json({
      token,
      userId: user._id,
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    const status = err.code === "MISMATCH" ? 400 : err.code === "LOCKED" ? 429 : 401;
    if (!err.code) {
      console.error("Error during OTP verification : ", err.message);
      return res.status(500).json({ message: "Server error!" });
    }
    res.status(status).json({ message: err.message, attemptsLeft: err.attemptsLeft });
  }
}

async function resendLoginOtp(req, res) {
  const { challengeToken } = req.body;

  if (!challengeToken) {
    return res.status(400).json({ message: "This sign-in session expired. Please start again." });
  }

  try {
    const decoded = verifyChallengeToken(challengeToken);
    const user = await User.findById(decoded.id).select("username email");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const challenge = await issueOtp(user);
    res.json({
      challengeToken: challenge.challengeToken,
      maskedEmail: maskEmail(user.email),
      expiresInMinutes: challenge.expiresInMinutes,
      resendAfterSeconds: challenge.resendAfterSeconds,
      devFallback: challenge.devFallback,
    });
  } catch (err) {
    if (err.code === "COOLDOWN") {
      return res.status(429).json({ message: err.message, retryAfter: err.retryAfter });
    }
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" || err.message === "Wrong token type") {
      return res.status(401).json({ message: "This sign-in session expired. Please start again." });
    }
    console.error("Error during OTP resend : ", err.message);
    res.status(500).json({ message: "Could not resend the code. Please try again." });
  }
}

async function getAllUsers(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const users = await User.find({})
      .select("username bio createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ page, limit, users });
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select(`${PUBLIC_PROFILE_FIELDS} followedUsers`);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error during fetching current user : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

async function getUserProfile(req, res) {
  const currentID = req.params.id;

  if (!isValidId(currentID)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  try {
    const user = await User.findById(currentID).select(PUBLIC_PROFILE_FIELDS).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const [followerCount, followingCount] = await Promise.all([
      User.countDocuments({ followedUsers: currentID }),
      User.findById(currentID).select("followedUsers").lean().then((u) => u?.followedUsers?.length || 0),
    ]);

    res.json({ ...user, followerCount, followingCount });
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, username, bio, location, website, password, currentPassword } = req.body;

  try {
    const user = await User.findById(currentID).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (email) user.email = email;
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new password." });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect." });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const safeUser = await User.findById(currentID).select(PUBLIC_PROFILE_FIELDS);
    res.json(safeUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "That username or email is already taken." });
    }
    console.error("Error during updating : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

async function deleteUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    const result = await User.findByIdAndDelete(currentID);
    if (!result) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during deleting : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

async function toggleFollowUser(req, res) {
  const targetId = req.params.id;

  if (!isValidId(targetId)) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  if (targetId === req.userId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  try {
    const [me, target] = await Promise.all([
      User.findById(req.userId),
      User.findById(targetId).select("_id"),
    ]);

    if (!target) {
      return res.status(404).json({ message: "User not found!" });
    }

    const alreadyFollowing = me.followedUsers.some((u) => u.toString() === targetId);
    if (alreadyFollowing) {
      me.followedUsers = me.followedUsers.filter((u) => u.toString() !== targetId);
    } else {
      me.followedUsers.push(targetId);
    }
    await me.save();

    res.json({ following: !alreadyFollowing, followingCount: me.followedUsers.length });
  } catch (err) {
    console.error("Error during follow toggle : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  verifyLoginOtp,
  resendLoginOtp,
  getMe,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  toggleFollowUser,
};
