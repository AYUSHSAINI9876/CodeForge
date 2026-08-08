const sgMail = require("@sendgrid/mail");
const { otpEmailTemplate, otpEmailText } = require("./emailTemplates");

let configuredKey = null;

// Read env lazily rather than at module load: this module gets required through
// the router tree, which can happen before dotenv has populated process.env.
function isEmailConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
}

function ensureApiKey() {
  const key = process.env.SENDGRID_API_KEY;
  if (key && key !== configuredKey) {
    sgMail.setApiKey(key);
    configuredKey = key;
  }
}

async function sendOtpEmail({ to, username, code, expiryMinutes }) {
  if (!isEmailConfigured()) {
    // Without a verified sender SendGrid rejects every send. In production that
    // must fail loudly rather than silently not delivering a login code.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email delivery is not configured (SENDGRID_API_KEY / SENDGRID_FROM_EMAIL missing).");
    }

    // Local development fallback so the flow is testable before SendGrid is set up.
    console.warn(
      `\n[dev] SendGrid not configured — OTP for ${to} is: ${code} (expires in ${expiryMinutes}m)\n`
    );
    return { delivered: false, devFallback: true };
  }

  ensureApiKey();

  await sgMail.send({
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME || "CodeForge",
    },
    subject: `${code} is your CodeForge verification code`,
    text: otpEmailText({ username, code, expiryMinutes }),
    html: otpEmailTemplate({ username, code, expiryMinutes }),
    // Login codes are transactional; keep them out of marketing suppression logic.
    mailSettings: { bypassListManagement: { enable: true } },
  });

  return { delivered: true, devFallback: false };
}

module.exports = { sendOtpEmail, isEmailConfigured };
