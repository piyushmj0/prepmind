const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: { value: true, message: "Token is required" },
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: automatically purges expired tokens after 24h (86400s)
// Prevents unbounded collection growth and eliminates scan latency
blacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Blacklist = mongoose.model("Blacklist", blacklistSchema);

module.exports = Blacklist;
