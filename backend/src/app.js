const express = require("express")
const authRouter = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app  = express()
app.set("trust proxy", 1) // Required for Render/Heroku to trust secure cookies
app.use(express.json())
app.use(cookieParser())
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : "http://localhost:5173";
app.use(cors({
    origin: frontendUrl,
    credentials: true
}))

// require all the routes here
app.use("/api/auth", authRouter)
const aiRouter = require("./routes/ai.routes")
app.use("/api/ai", aiRouter)





module.exports = app