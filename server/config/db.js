const dns = require("dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (uri && uri.startsWith("mongodb+srv")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      console.log("Using public DNS servers for SRV lookup: 8.8.8.8, 1.1.1.1");
    }

    await mongoose.connect(uri);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Database Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
