const mongoose = require("mongoose")


const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: { value: true, message: "Token is required" }
  }
},{
    timestamps: true
})


const Blacklist = mongoose.model("Blacklist", blacklistSchema)

module.exports = Blacklist

