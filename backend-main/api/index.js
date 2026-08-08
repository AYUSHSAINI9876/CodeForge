// Vercel serverless entry point. Vercel treats this file's export as the
// request handler; an Express app is itself a valid (req, res) function.
const app = require("../app");

module.exports = app;
