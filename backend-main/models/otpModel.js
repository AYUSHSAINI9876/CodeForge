const mongoose = require("mongoose");
const { Schema } = mongoose;

const OtpSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Only the hash is stored — a leaked database dump must not yield usable codes.
  codeHash: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["login"],
    default: "login",
  },
  attempts: {
    type: Number,
    default: 0,
  },
  consumedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

// MongoDB removes documents once expiresAt passes, so stale codes cannot pile up.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ user: 1, createdAt: -1 });

const Otp = mongoose.model("Otp", OtpSchema);
module.exports = Otp;
