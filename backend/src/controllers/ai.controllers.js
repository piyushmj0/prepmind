const aiService = require("../services/ai.service");
const pdfParse = require("pdf-parse");

async function generateReport(req, res) {
  try {
    let { resume, selfDescription, jobDescription } = req.body;

    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      resume = pdfData.text;
    }

    if (!resume || !jobDescription) {
      return res.status(400).json({ message: "Resume (text or PDF) and Job Description are required." });
    }

    const report = await aiService.generateInterviewReport({
      resume,
      selfDescription,
      jobDescription,
    });

    res.status(200).json({
      message: "Report generated successfully",
      report,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Failed to generate report." });
  }
}

module.exports = {
  generateReport,
};
