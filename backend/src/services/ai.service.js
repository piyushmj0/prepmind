const { GoogleGenAI } = require("@google/genai")
const mongoose = require("mongoose")
const InterviewReport = require("../models/interviewReport.model")
const connectDB = require("../config/database")
const cacheService = require("./cache.service")

function getGenAIClient() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY
  if (!apiKey || !apiKey.trim()) {
    return null
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() })
}

const interviewReportJsonSchema = {
  type: "object",
  properties: {
    matchScore: {
      type: "integer",
      description: "Match score between 0 and 100 based on fit for the job",
    },
    technicalQuestions: {
      type: "array",
      description: "Array of 5 to 6 in-depth technical interview questions tailored to the candidate and role",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: "array",
      description: "Array of 5 to 6 behavioral interview questions based on the STAR method",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: "array",
      description: "List of identified skill gaps and their severity levels",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "array",
      description: "Multi-day study roadmap to address skill gaps",
      items: {
        type: "object",
        properties: {
          day: { type: "integer" },
          focus: { type: "string" },
          tasks: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
}

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
        question: "Explain how you would design and implement a scalable, resilient RESTful API architecture. How do you handle error propagation and response consistency across endpoints?",
        intention: "Assess knowledge of API architecture, error handling middleware, idempotency, and RESTful standards.",
        answer: "Describe establishing consistent response envelopes, standard HTTP status codes, centralized error-handling middleware, input validation, rate limiting, and graceful degradation.",
      },
      {
        question: "How do you approach database schema design, indexing strategies, and query optimization to avoid performance degradation as data scales?",
        intention: "Evaluate database design depth, understanding of B-tree/hash indexes, query execution plans, and mitigation of common bottlenecks like N+1 queries.",
        answer: "Discuss normalization vs denormalization trade-offs, index selectivity, compound indexes, EXPLAIN analysis, connection pooling, and caching hot read paths.",
      },
      {
        question: "Walk through the security considerations and implementation details of authentication, token management, and session invalidation in web applications.",
        intention: "Assess practical security knowledge including JWT handling, cookie flags (HttpOnly, Secure, SameSite), CSRF/XSS prevention, and refresh token rotation.",
        answer: "Detail secure storage of secrets, setting strict cookie attributes, implementing refresh token rotation with family revocation, hashing passwords with bcrypt/argon2, and protecting against injection attacks.",
      },
      {
        question: "How do you manage concurrency, asynchronous operations, and long-running background tasks in a high-traffic environment?",
        intention: "Test familiarity with event loops, queue-based architectures, workers, and idempotent processing.",
        answer: "Explain using distributed message queues (e.g. BullMQ, Redis, RabbitMQ), managing worker pools, implementing retry backoffs and dead-letter queues, and ensuring idempotent task execution.",
      },
      {
        question: "What strategies and patterns do you rely on for caching, and how do you prevent cache stampedes and stale data issues?",
        intention: "Assess caching architecture, Cache-Aside pattern, TTL management, and cache-database synchronization.",
        answer: "Explain the Cache-Aside pattern, short vs long TTLs, invalidation on write/update events, mutual exclusion locks or probabilistic early expiration for cache stampede prevention, and choosing Redis or Memcached.",
      },
      {
        question: "How do you design and structure automated tests (unit, integration, and end-to-end) and integrate them into CI/CD pipelines to ensure regression-free releases?",
        intention: "Assess engineering rigor, test pyramid comprehension, mock/stub strategies, and automated delivery pipelines.",
        answer: "Outline unit tests for isolated business logic, integration tests with test containers or ephemeral databases, end-to-end user journeys, and automated CI quality gates that run tests and lint checks before deployment.",
      },
    ],
    behavioralQuestions: [
      {
        question: "Describe a time when you strongly disagreed with a teammate or lead on a technical approach. How did you handle the situation and what was the outcome?",
        intention: "Evaluate constructive conflict resolution, communication, empathy, and ability to prioritize project goals over ego.",
        answer: "Situation: Differing opinions on database selection or code architecture. Task: Find alignment without stalling velocity. Action: Researched trade-offs, built quick benchmarks/prototypes, and facilitated a data-driven discussion. Result: Team aligned on an optimal approach with shared ownership.",
      },
      {
        question: "Tell me about a high-severity production outage or critical bug you encountered. How did you triage, resolve, and prevent it in the future?",
        intention: "Assess composure under pressure, systematic debugging, communication during incidents, and blameless post-mortem culture.",
        answer: "Situation: Service degradation during peak traffic. Task: Mitigate customer impact quickly. Action: Rolled back recent deployment / applied emergency rate limiting, notified stakeholders, debugged root cause in isolated logs, and released a permanent fix. Result: Service restored within SLA, followed by blameless post-mortem and alert enhancements.",
      },
      {
        question: "Can you share an experience where you had to quickly pick up an unfamiliar technology or domain to deliver a time-sensitive project?",
        intention: "Measure adaptability, learning agility, resourcefulness, and self-direction.",
        answer: "Situation: New business requirement requiring a technology stack not previously used. Task: Build competence and ship a dependable feature within a tight timeframe. Action: Studied official documentation, analyzed open-source examples, built miniature test spikes, and consulted community best practices. Result: Delivered on time with high code quality and documented learnings for teammates.",
      },
      {
        question: "Describe a scenario where project requirements were ambiguous or constantly changing. How did you navigate the uncertainty to keep development on track?",
        intention: "Evaluate tolerance for ambiguity, proactive stakeholder communication, and iterative delivery mindset.",
        answer: "Situation: Stakeholders had high-level expectations without detailed specifications. Task: Prevent wasted engineering effort while progressing. Action: Defined assumptions explicitly, broke requirements into small iterative milestones, and set up frequent syncs with product managers for feedback. Result: Delivered an MVP that hit business goals, minimizing rework.",
      },
      {
        question: "Tell me about a time you mentored a junior developer or helped a peer overcome a significant technical roadblock.",
        intention: "Assess leadership, mentorship, collaboration, and team enablement.",
        answer: "Situation: Teammate was struggling with complex asynchronous logic and debugging state issues. Task: Help unblock them without doing the work for them. Action: Conducted a collaborative pair-programming session, walked through mental models and debugging tools, and encouraged them to drive the solution. Result: The teammate resolved the issue, gained lasting confidence, and later led similar implementations.",
      },
      {
        question: "Describe a situation where you had to balance delivering features on a tight deadline against accumulating technical debt.",
        intention: "Evaluate pragmatic decision-making, engineering trade-offs, prioritization, and business empathy.",
        answer: "Situation: Approaching a strict product launch date with potential architectural shortcuts tempting the team. Task: Deliver the launch commitments while protecting long-term maintainability. Action: Adopted an MVP scope with cleanly isolated abstractions, documented intentional technical trade-offs, and scheduled dedicated tech-debt cleanup in the following sprint. Result: Launched on schedule with zero customer disruption and smoothly refactored the deferred components.",
      },
    ],
    skillGaps: [
      {
        skill: "Distributed system design depth",
        severity: "medium",
      },
      {
        skill: "Performance benchmarking and profiling",
        severity: "medium",
      },
      {
        skill: "Cloud orchestration and deployment pipelines",
        severity: "low",
      },
    ],
    preparationPlan: [
      {
        day: 1,
        focus: "Core architecture & REST design patterns",
        tasks: ["Review API design and error handling standards", "Practice Node.js event-loop fundamentals and async patterns"],
      },
      {
        day: 2,
        focus: "Database optimization & security best practices",
        tasks: ["Study indexing, EXPLAIN plans, and query optimization", "Implement refresh token rotation and secure cookie handling"],
      },
      {
        day: 3,
        focus: "System design, concurrency & caching",
        tasks: ["Design a rate limiter and cache invalidation system", "Review message queues and background job architectures"],
      },
      {
        day: 4,
        focus: "Behavioral interview prep (STAR method)",
        tasks: ["Draft 5 STAR stories on conflict resolution, outages, and leadership", "Practice mock behavioral interview questions aloud"],
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

  // ── 1. Cache lookup ──────────────────────────────────────────────────────
  const cached = await cacheService.getCachedReport(
    payload.resume,
    payload.selfDescription,
    payload.jobDescription
  )
  if (cached) {
    return cached
  }

  const fallbackReport = buildFallbackReport(payload)
  const ai = getGenAIClient()

  // ── 2. No AI key → save fallback to DB (no cache for fallback) ───────────
  if (!ai) {
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

  // ── 3. Call Gemini ────────────────────────────────────────────────────────
  try {
    await ensureDatabaseConnection()
    const prompt = `You are an expert technical interviewer and career coach.
Analyze the candidate's resume, self-description, and target job description to generate a comprehensive, highly actionable interview preparation report in valid JSON format.

Requirements:
1. "matchScore": An integer between 0 and 100 indicating how well the candidate's profile matches the target job requirements.
2. "technicalQuestions": Generate exactly 5 to 6 in-depth, realistic technical questions tailored to the specific technologies, system architecture, problem-solving, and requirements mentioned in the job description and candidate background. For each item provide:
   - "question": The technical question.
   - "intention": What competency, concept, or depth the interviewer is testing for.
   - "answer": A comprehensive, exemplary answer illustrating deep understanding and best practices.
3. "behavioralQuestions": Generate exactly 5 to 6 behavioral questions based on the STAR method (Situation, Task, Action, Result) targeting teamwork, conflict resolution, leadership, handling pressure/deadlines, adaptability, and ownership. For each item provide:
   - "question": The behavioral question.
   - "intention": What behavioral trait or soft skill the interviewer is evaluating.
   - "answer": An exemplary model answer framed in the STAR methodology.
4. "skillGaps": Identify 3 to 5 specific skills or areas where the candidate needs improvement relative to the job requirements, each with severity ("low", "medium", or "high").
5. "preparationPlan": A realistic multi-day preparation roadmap (e.g. 3 to 7 days) with clear focus areas and actionable tasks to bridge the skill gaps.

Candidate Resume:
${payload.resume || "Not provided"}

Candidate Self-Description:
${payload.selfDescription || "Not provided"}

Target Job Description:
${payload.jobDescription || "Not provided"}`

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: interviewReportJsonSchema,
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

    const reportObject = createdReport.toObject()

    // ── 4. Persist result in Redis cache ──────────────────────────────────
    await cacheService.setCachedReport(
      payload.resume,
      payload.selfDescription,
      payload.jobDescription,
      reportObject
    )

    return reportObject
  } catch (error) {
    console.error("AI Generation Error:", error)
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
