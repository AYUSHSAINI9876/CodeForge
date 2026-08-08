// Load env before anything else is required, so modules that read process.env
// at require-time see real values.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mainRouter = require("./routes/main.router");
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, health checks) with no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));

// Prefix match, so this also covers /login/verify-otp and /login/resend-otp.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});
app.use(["/login", "/signup"], authLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error: ", err.message);
    res.status(503).json({ error: "Database unavailable. Please try again shortly." });
  }
});

app.use("/", mainRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Centralized error handler — keeps stack traces out of API responses.
app.use((err, req, res, next) => {
  console.error("Unhandled error: ", err);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed." });
  }
  res.status(err.status || 500).json({ error: "Server error" });
});

module.exports = app;
