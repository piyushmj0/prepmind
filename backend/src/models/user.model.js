const mongoose = require("mongoose")


const userschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [true , "Username already exists"],
    },
    email: {
        type: String,
        required: true,
        unique: [true , "Email already exists"],
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password must be at least 6 characters long"],
    },
    resetPasswordOTP: {
        type: String,
        default: null,
    },
    resetPasswordOTPExpires: {
        type: Date,
        default: null,
    }
})

const UserModel = mongoose.model("User", userschema)

module.exports = UserModel