const express = require("express")
const authRouter = require("./routes/auth.routes")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app  = express()
app.set("trust proxy", 1) // Required for Render/Heroku to trust secure cookies
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : null
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true
}))

// require all the routes here
app.use("/api/auth", authRouter)
const aiRouter = require("./routes/ai.routes")
app.use("/api/ai", aiRouter)





module.exports = app