require("dotenv").config()

const app        = require("./src/app")
const connectDB  = require("./src/config/database")
const { connectRedis } = require("./src/config/redis")

const startServer = async () => {
  try {
    // ── 1. MongoDB (required) ───────────────────────────────────────────────
    await connectDB()

    // ── 2. Redis  (optional — app degrades gracefully if unavailable) ───────
    await connectRedis()

    // ── 3. HTTP server ───────────────────────────────────────────────────────
    const port = process.env.PORT || 3000
    app.listen(port, () => {
      console.log(`[Server] Running on port ${port}`)
    })
  } catch (error) {
    console.error("[Server] Failed to start:", error)
    process.exit(1)
  }
}

startServer()
