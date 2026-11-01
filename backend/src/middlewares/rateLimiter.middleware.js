/**
 * rateLimiter.middleware.js
 * -------------------------
 * Two rate limiters wired together:
 *
 *   1. redisRateLimiter  — sliding-window counter stored in Redis.
 *                          Used when Redis is available; accurate across
 *                          multiple server instances.
 *
 *   2. memoryRateLimiter — express-rate-limit with in-memory store.
 *                          Automatic fallback when Redis is down.
 *                          Accurate per-process only (fine for single-instance).
 *
 * The exported middleware tries Redis first; if the client is unavailable it
 * falls through to the in-memory limiter.  Either way the caller gets the
 * correct 429 response with Retry-After and X-RateLimit-* headers.
 *
 * Configuration via environment variables (all optional):
 *   RATE_LIMIT_AI_WINDOW_MS   — window length in ms   (default 15 min)
 *   RATE_LIMIT_AI_MAX         — max requests per window (default 10)
 *   RATE_LIMIT_AUTH_WINDOW_MS — window length for auth routes (default 15 min)
 *   RATE_LIMIT_AUTH_MAX       — max auth requests (default 20)
 */

const rateLimit = require("express-rate-limit")
const { ipKeyGenerator } = require("express-rate-limit")
const { getRedisClient } = require("../config/redis")

// ── Config ────────────────────────────────────────────────────────────────────
const AI_WINDOW_MS = parseInt(process.env.RATE_LIMIT_AI_WINDOW_MS  || "900000", 10) // 15 min
const AI_MAX       = parseInt(process.env.RATE_LIMIT_AI_MAX        || "10",     10)
const AUTH_WINDOW  = parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || "900000", 10)
const AUTH_MAX     = parseInt(process.env.RATE_LIMIT_AUTH_MAX       || "20",     10)

// ── Shared response formatter ─────────────────────────────────────────────────
function rateLimitHandler(req, res) {
  const retryAfter = Math.ceil(res.getHeader("Retry-After") || 60)
  return res.status(429).json({
    success    : false,
    message    : "Too many requests. Please slow down and try again later.",
    retryAfter : retryAfter,
  })
}

// ── In-memory fallback limiter factory ───────────────────────────────────────
function makeMemoryLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders : true,   // X-RateLimit-* headers
    legacyHeaders   : false,
    message,
    handler         : rateLimitHandler,
    keyGenerator    : (req) => {
      // Prefer authenticated user ID; otherwise use IPv6-safe IP helper
      return req.user?.id || ipKeyGenerator(req)
    },
  })
}

// ── Redis sliding-window limiter ──────────────────────────────────────────────
/**
 * Implements a sliding-window rate limiter using a Redis sorted set.
 *   Key  : `rl:{namespace}:{identifier}`
 *   Score: Unix timestamp (ms) of the request
 *   Value: unique request ID (timestamp + random suffix)
 *
 * Algorithm:
 *   1. Remove entries older than (now - windowMs)
 *   2. Count remaining entries
 *   3. If count >= max → reject with 429
 *   4. Otherwise add new entry and set TTL on the key
 */
async function redisWindowLimiter(req, res, next, { namespace, windowMs, max }) {
  const redis = getRedisClient()
  if (!redis) return null // signal: fall through to memory limiter

  const identifier = req.user?.id || ipKeyGenerator(req)
  const key  = `rl:${namespace}:${identifier}`
  const now  = Date.now()
  const cutoff = now - windowMs

  try {
    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, "-inf", cutoff)      // prune old entries
    pipeline.zcard(key)                                  // count remaining
    pipeline.zadd(key, now, `${now}-${Math.random()}`)  // add current request
    pipeline.expire(key, Math.ceil(windowMs / 1000))    // keep key alive

    const results = await pipeline.exec()
    // results[1] = [err, count before this request]
    const countBefore = results[1][1]

    // Set informative headers
    const remaining = Math.max(0, max - countBefore - 1)
    const resetAt   = Math.ceil((now + windowMs) / 1000)
    res.setHeader("X-RateLimit-Limit",     max)
    res.setHeader("X-RateLimit-Remaining", remaining)
    res.setHeader("X-RateLimit-Reset",     resetAt)

    if (countBefore >= max) {
      // Remove the entry we just added (request denied)
      await redis.zremrangebyscore(key, now, now)
      const retryAfterSecs = Math.ceil(windowMs / 1000)
      res.setHeader("Retry-After", retryAfterSecs)
      return rateLimitHandler(req, res)
    }

    return next()
  } catch (err) {
    console.error("[RateLimit] Redis error:", err.message)
    return null // fall through to memory limiter on Redis failure
  }
}

// ── Middleware factories ───────────────────────────────────────────────────────

/**
 * Rate limiter for the /api/ai/* Gemini endpoints.
 * 10 requests per 15-minute window per user/IP.
 */
const aiMemoryLimiter = makeMemoryLimiter({
  windowMs : AI_WINDOW_MS,
  max      : AI_MAX,
  message  : "AI generation limit reached",
})

async function aiRateLimiter(req, res, next) {
  const result = await redisWindowLimiter(req, res, next, {
    namespace : "ai",
    windowMs  : AI_WINDOW_MS,
    max       : AI_MAX,
  })
  if (result === null) {
    // Redis unavailable — use in-memory fallback
    return aiMemoryLimiter(req, res, next)
  }
}

/**
 * Rate limiter for the /api/auth/* endpoints (login, register).
 * 20 requests per 15-minute window per IP.
 */
const authMemoryLimiter = makeMemoryLimiter({
  windowMs : AUTH_WINDOW,
  max      : AUTH_MAX,
  message  : "Too many authentication attempts",
})

async function authRateLimiter(req, res, next) {
  const result = await redisWindowLimiter(req, res, next, {
    namespace : "auth",
    windowMs  : AUTH_WINDOW,
    max       : AUTH_MAX,
  })
  if (result === null) {
    return authMemoryLimiter(req, res, next)
  }
}

module.exports = { aiRateLimiter, authRateLimiter }

