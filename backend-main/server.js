const app = require("./app");
const connectDB = require("./config/db");

async function startServer() {
  const port = process.env.PORT || 3000;

  try {
    await connectDB();
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("Unable to connect to MongoDB: ", err.message);
  }

  app.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
  });
}

module.exports = startServer;
