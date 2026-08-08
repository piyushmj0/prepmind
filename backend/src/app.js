const express = require("express")
const authRouter = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app  = express()
app.set("trust proxy", 1) // Required for Render/Heroku to trust secure cookies
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

// require all the routes here
app.use("/api/auth", authRouter)
const aiRouter = require("./routes/ai.routes")
app.use("/api/ai", aiRouter)





module.exports = app