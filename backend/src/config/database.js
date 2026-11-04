const mongoose = require("mongoose");

async function connectDB() {
  try {
    // Tuning MongoDB Connection Pool for 200+ Concurrent Users
    // - maxPoolSize: 50 concurrent socket connections to handle peak loads without socket queuing
    // - minPoolSize: 10 pre-warmed connections to avoid handshake latency on cold queries
    // - serverSelectionTimeoutMS: 5000 fail-fast threshold
    // - socketTimeoutMS: 45000 keep sockets healthy
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: true, // ensure indexes are created automatically in production
    });

    console.log("[MongoDB] Connected successfully (Pool: min 10 / max 50 sockets)");
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error; // propagate so server.js can handle restart/exit
  }
}

module.exports = connectDB;
