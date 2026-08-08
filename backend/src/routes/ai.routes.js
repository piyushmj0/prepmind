const express = require("express");
const multer = require("multer");
const { generateReport } = require("../controllers/ai.controllers");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public route that accepts a file upload named "resumeFile"
router.post("/generate", upload.single("resumeFile"), generateReport);

module.exports = router;

