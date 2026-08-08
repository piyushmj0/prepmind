const {Router} = require("express")
const authController = require("../controllers/auth.controllers")
const auathMiddleware = require("../middlewares/auth.middleware")

const authRouter = Router()

/**
 * @route POST /api/auth/register
 * @description register a new user
 * @access Public
 */

authRouter.post("/register", authController.registerUser)

/**
 * @route POST /api/auth/login
 * @description login a user
 * @access Public
 */
authRouter.post("/login", authController.loginUser)


/**
 * @route GET /api/auth/logout
 * @description logout a user
 * @access Public
 */
authRouter.get("/logout", authController.logoutUser)


// Protected route to get authenticated user details
authRouter.get("/get-me", auathMiddleware.authUser, authController.getMe)

// Protected routes for password and name update
authRouter.post("/send-otp", auathMiddleware.authUser, authController.sendOtp)
authRouter.post("/update-password", auathMiddleware.authUser, authController.updatePassword)
authRouter.put("/update-name", auathMiddleware.authUser, authController.updateName)

module.exports = authRouter