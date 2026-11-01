const express = require("express")
const multer  = require("multer")
const { generateReport } = require("../controllers/ai.controllers")
const { aiRateLimiter }  = require("../middlewares/rateLimiter.middleware")
const { authUser }       = require("../middlewares/auth.middleware")

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

/**
 * POST /api/ai/generate
 *
 * Middleware chain:
 *   authUser       — must be logged in
 *   aiRateLimiter  — 10 req / 15 min per user (Redis) or per IP (memory fallback)
 *   upload.single  — optional PDF resume upload
 *   generateReport — controller
 */
router.post(
  "/generate",
  authUser,
  aiRateLimiter,
  upload.single("resumeFile"),
  generateReport
)

module.exports = router
