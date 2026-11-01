const { Router } = require("express")
const authController  = require("../controllers/auth.controllers")
const { authUser }    = require("../middlewares/auth.middleware")
const { authRateLimiter } = require("../middlewares/rateLimiter.middleware")

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @access Public  (rate-limited)
 */
authRouter.post("/register", authRateLimiter, authController.registerUser)

/**
 * @route POST /api/auth/login
 * @access Public  (rate-limited)
 */
authRouter.post("/login", authRateLimiter, authController.loginUser)

/**
 * @route GET /api/auth/logout
 * @access Public
 */
authRouter.get("/logout", authController.logoutUser)

// ── Protected routes ────────────────────────────────────────────────────────

/** @route GET  /api/auth/get-me */
authRouter.get("/get-me", authUser, authController.getMe)

/** @route POST /api/auth/send-otp */
authRouter.post("/send-otp", authUser, authController.sendOtp)

/** @route POST /api/auth/update-password */
authRouter.post("/update-password", authUser, authController.updatePassword)

/** @route PUT  /api/auth/update-name */
authRouter.put("/update-name", authUser, authController.updateName)

module.exports = authRouter
