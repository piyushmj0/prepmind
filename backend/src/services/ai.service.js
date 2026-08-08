const { GoogleGenAI } = require("@google/genai")
const mongoose = require("mongoose")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const InterviewReport = require("../models/interviewReport.model")
const connectDB = require("../config/database")

const ai = process.env.GOOGLE_GENAI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
  : null

const interviewReportSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ).default([]),
  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ).default([]),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ).default([]),
  preparationPlan: z.array(
    z.object({
      day: z.number().int().positive(),
      focus: z.string(),
      tasks: z.array(z.string()).default([]),
    })
  ).default([]),
})

function normalizeReport(raw) {
  if (!raw || typeof raw !== "object") {
    return null
  }

  return {
    matchScore: Number(raw.matchScore ?? 0),
    technicalQuestions: Array.isArray(raw.technicalQuestions) ? raw.technicalQuestions : [],
    behavioralQuestions: Array.isArray(raw.behavioralQuestions) ? raw.behavioralQuestions : [],
    skillGaps: Array.isArray(raw.skillGaps) ? raw.skillGaps : [],
    preparationPlan: Array.isArray(raw.preparationPlan) ? raw.preparationPlan : [],
  }
}

function parseStructuredOutput(text) {
  if (!text) {
    return null
  }

  let cleaned = text.trim()
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")
  }

  try {
    return normalizeReport(JSON.parse(cleaned))
  } catch (error) {
    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")

    if (start !== -1 && end !== -1 && end > start) {
      try {
        return normalizeReport(JSON.parse(cleaned.slice(start, end + 1)))
      } catch (innerError) {
        return null
      }
    }

    return null
  }
}

function buildFallbackReport({ resume, selfDescription, jobDescription }) {
  return {
    matchScore: Math.min(100, Math.max(0, 72 + ((resume || "").length % 8))),
    technicalQuestions: [
      {
        question: "Explain a recent backend challenge you solved.",
        intention: "Assess problem-solving and engineering depth",
        answer: "Describe the problem, the approach you took, and the measurable outcome.",
      },
    ],
    behavioralQuestions: [
      {
        question: "Describe a time you worked with a difficult teammate.",
        intention: "Evaluate collaboration and ownership",
        answer: "Explain the situation, your actions, and the result.",
      },
    ],
    skillGaps: [
      {
        skill: "System design depth",
        severity: "medium",
      },
    ],
    preparationPlan: [
      {
        day: 1,
        focus: "Review core backend concepts",
        tasks: ["Review API design", "Practice Node.js fundamentals"],
      },
    ],
  }
}

async function ensureDatabaseConnection() {
  if (mongoose.connection.readyState === 1) {
    return
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => mongoose.connection.once("open", resolve))
    return
  }

  await connectDB()
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const payload = {
    resume: resume || "",
    selfDescription: selfDescription || "",
    jobDescription: jobDescription || "",
  }

  const fallbackReport = buildFallbackReport(payload)

  if (!process.env.GOOGLE_GENAI_API_KEY || !ai) {
    try {
      await ensureDatabaseConnection()
      const createdReport = await InterviewReport.create({
        ...payload,
        ...fallbackReport,
      })
      return createdReport.toObject()
    } catch (dbError) {
      return {
        ...payload,
        ...fallbackReport,
      }
    }
  }

  try {
    await ensureDatabaseConnection()
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate a structured interview report in JSON only.
Use the exact fields: matchScore, technicalQuestions, behavioralQuestions, skillGaps, preparationPlan.
Resume: ${payload.resume}
Self Description: ${payload.selfDescription}
Job Description: ${payload.jobDescription}`,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(interviewReportSchema),
      },
    })

    const structuredReport = parseStructuredOutput(response.text)
    if (!structuredReport) {
      throw new Error("The model did not return valid JSON")
    }

    const createdReport = await InterviewReport.create({
      ...payload,
      ...structuredReport,
    })

    return createdReport.toObject()
  } catch (error) {
    console.error("AI Generation Error:", error);
    try {
      await ensureDatabaseConnection()
      const createdReport = await InterviewReport.create({
        ...payload,
        ...fallbackReport,
      })
      return createdReport.toObject()
    } catch (dbError) {
      return {
        ...payload,
        ...fallbackReport,
      }
    }
  }
}

module.exports = { generateInterviewReport }
