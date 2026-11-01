/**
 * cache.service.js
 * ----------------
 * Thin wrapper around Redis for key-value caching.
 *
 * Key design decisions:
 *  • Namespace every key with a prefix to avoid collisions.
 *  • SHA-256 hash long inputs so keys stay short and safe.
 *  • All methods return null / no-op when Redis is unavailable,
 *    so callers never need to check whether Redis is up.
 *  • Serialises/deserialises JSON transparently.
 */

const crypto = require("crypto")
const { getRedisClient } = require("../config/redis")

// Default TTLs (seconds)
const TTL = {
  REPORT   : 60 * 60 * 6,  // 6 hours  — AI-generated interview reports
  SHORT    : 60 * 5,        // 5 minutes — miscellaneous short-lived data
}

const NS = {
  REPORT: "prepmind:report:",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Produce a deterministic SHA-256 cache key from arbitrary inputs.
 * Normalises whitespace so minor formatting differences don't bust the cache.
 */
function buildCacheKey(namespace, ...parts) {
  const raw = parts
    .map(p => (p || "").toString().toLowerCase().replace(/\s+/g, " ").trim())
    .join("|")
  const hash = crypto.createHash("sha256").update(raw).digest("hex")
  return `${namespace}${hash}`
}

// ── Core operations ───────────────────────────────────────────────────────────

async function get(key) {
  const redis = getRedisClient()
  if (!redis) return null
  try {
    const raw = await redis.get(key)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error("[Cache] GET error:", err.message)
    return null
  }
}

async function set(key, value, ttlSeconds = TTL.SHORT) {
  const redis = getRedisClient()
  if (!redis) return
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds)
  } catch (err) {
    console.error("[Cache] SET error:", err.message)
  }
}

async function del(key) {
  const redis = getRedisClient()
  if (!redis) return
  try {
    await redis.del(key)
  } catch (err) {
    console.error("[Cache] DEL error:", err.message)
  }
}

// ── Domain-specific helpers ───────────────────────────────────────────────────

/**
 * Returns the cache key for an interview report derived from the three inputs.
 */
function reportKey(resume, selfDescription, jobDescription) {
  return buildCacheKey(NS.REPORT, resume, selfDescription, jobDescription)
}

/**
 * Fetch a cached interview report. Returns null on miss.
 */
async function getCachedReport(resume, selfDescription, jobDescription) {
  const key = reportKey(resume, selfDescription, jobDescription)
  const cached = await get(key)
  if (cached) {
    console.log("[Cache] HIT  →", key.slice(0, 40) + "…")
    return { ...cached, _fromCache: true }
  }
  console.log("[Cache] MISS →", key.slice(0, 40) + "…")
  return null
}

/**
 * Persist a freshly generated interview report in Redis.
 */
async function setCachedReport(resume, selfDescription, jobDescription, report) {
  const key = reportKey(resume, selfDescription, jobDescription)
  await set(key, report, TTL.REPORT)
  console.log("[Cache] SET  →", key.slice(0, 40) + "…", `(TTL ${TTL.REPORT}s)`)
}

module.exports = {
  get,
  set,
  del,
  getCachedReport,
  setCachedReport,
  TTL,
}

