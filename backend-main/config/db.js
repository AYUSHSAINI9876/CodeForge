const mongoose = require("mongoose");

// Serverless functions can be invoked many times per minute, each in a
// (possibly reused) execution context. Without caching the connection
// promise, every cold invocation would open a brand new connection to
// MongoDB, quickly exhausting the connection pool and adding latency.
let cachedConnection = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error("MONGODB_URI is not set.");
  }

  cachedConnection = mongoose.connect(mongoURI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });

  await cachedConnection;
  return cachedConnection;
}

module.exports = connectDB;
