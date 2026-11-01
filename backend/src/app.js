const express      = require("express")
const cookieParser = require("cookie-parser")
const cors         = require("cors")

const authRouter = require("./routes/auth.routes")
const aiRouter   = require("./routes/ai.routes")

const app = express()

// ── Trust proxy (required for Render / Heroku secure cookies + real IPs) ─────
app.set("trust proxy", 1)

// ── Body / cookie parsing ─────────────────────────────────────────────────────
app.use(express.json())
app.use(cookieParser())

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : null,
].filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`))
      }
    },
    credentials: true,
  })
)

// ── Health check (useful for uptime monitors) ─────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter)
app.use("/api/ai",   aiRouter)

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[App] Unhandled error:", err.message)
  res.status(err.status || 500).json({ message: err.message || "Internal server error" })
})

module.exports = app
