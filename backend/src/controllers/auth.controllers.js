const userModel = require("../models/user.model")
const   bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Blacklist = require("../models/blacklist.model")

/**
 * @name registerUser
 * @description register a new user , expects username ,email and password in the request body
 * @access Public
*/
async function registerUser(req, res) {

  const { username, email, password } = req.body

  if(!username || !email || !password) {
    return res.status(400).json({ message: "Please provide username, email and password" })
  } 

  const isUserExist = await userModel.findOne({ 
    $or: [{ email: email }, { username: username }]
   })

  if(isUserExist) {
    return res.status(400).json({ message: "User already exists" })
  }

  const hash = await bcrypt.hash(password, 10)

  const newUser = new userModel({
    username,
    email,
    password: hash
  })

  await newUser.save()

  const token = jwt.sign({ id: newUser._id , username: newUser.username }, process.env.JWT_SECRET, { expiresIn: "1d" })

  res.cookie("token", token) 

  res.status(201).json({ message: "User registered successfully", 
    user: {
      id: newUser._id,
      username: newUser.username,
    },
    token
   })

}

//Login user
async function loginUser(req, res) {
  const { email, password } = req.body  

  const user = await userModel.findOne({ email })

  if(!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if(!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" })
  }

  const token = jwt.sign({ id: user._id , username: user.username }, process.env.JWT_SECRET, { expiresIn: "1d" })

  res.cookie("token", token) 

  res.status(200).json({ message: "User logged in successfully", 
    user: {
      id: user._id,
      username: user.username,
    },
    token
   })
}

async function logoutUser(req, res) {
  const token = req.cookies.token 
  
  if(token){
    await Blacklist.create({ token })
  }
  res.clearCookie("token")
  res.status(200).json({ message: "User logged out successfully" })
}

async function getMe(req, res) {
  const user = await userModel.findById(req.user.id)
  res.status(200).json({ message: "User authenticated successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  })      
}

// Nodemailer config for Ethereal (Fake SMTP for testing)
const nodemailer = require("nodemailer");

let transporter;
nodemailer.createTestAccount().then((account) => {
  transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
});

async function sendOtp(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user with 10 minute expiration
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    if (transporter) {
      const info = await transporter.sendMail({
        from: '"PrepMind" <noreply@prepmind.com>',
        to: user.email,
        subject: "Your Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      });
      console.log("OTP Email URL: %s", nodemailer.getTestMessageUrl(info));
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

async function updatePassword(req, res) {
  try {
    const { otp, newPassword } = req.body;
    
    if (!otp || !newPassword) {
      return res.status(400).json({ message: "OTP and new password are required" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.resetPasswordOTPExpires) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update password" });
  }
}

async function updateName(req, res) {
  try {
    const { username } = req.body;
    
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: "Username cannot be empty" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the username is already taken by another user
    const isTaken = await userModel.findOne({ username: username.trim(), _id: { $ne: req.user.id } });
    if (isTaken) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    user.username = username.trim();
    await user.save();

    res.status(200).json({ message: "Name updated successfully", user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update name" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  sendOtp,
  updatePassword,
  updateName
}