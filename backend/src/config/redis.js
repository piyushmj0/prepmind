/**
 * redis.js
 * --------
 * Singleton ioredis client with graceful degradation.
 * If REDIS_URL is not set, or the connection fails, every cache/rate-limit
 * operation falls back silently so the app keeps running without Redis.
 */

const Redis = require("ioredis")

let client = null
let isReady = false

function createClient() {
  const url = process.env.REDIS_URL
  if (!url) {
    console.warn("[Redis] REDIS_URL not set — caching and Redis-backed rate limiting disabled.")
    return null
  }

  const redis = new Redis(url, {
    // Retry with exponential back-off (max 3 attempts at startup)
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null // stop retrying → triggers error event
      return Math.min(times * 200, 2000)
    },
    enableReadyCheck: true,
    lazyConnect: true,
  })

  redis.on("connect",  ()    => console.log("[Redis] Connected"))
  redis.on("ready",   ()    => { isReady = true;  console.log("[Redis] Ready") })
  redis.on("error",   (err) => { isReady = false; console.error("[Redis] Error:", err.message) })
  redis.on("close",   ()    => { isReady = false; console.warn("[Redis] Connection closed") })
  redis.on("reconnecting", () => console.log("[Redis] Reconnecting…"))

  return redis
}

/**
 * Initialise Redis. Called once from server.js at startup.
 * Never throws — a failure just leaves caching disabled.
 */
async function connectRedis() {
  if (client) return client
  client = createClient()
  if (!client) return null

  try {
    await client.connect()
  } catch (err) {
    console.error("[Redis] Failed to connect at startup:", err.message)
    isReady = false
  }
  return client
}

/** Returns the live client, or null if Redis is unavailable. */
function getRedisClient() {
  return isReady ? client : null
}

module.exports = { connectRedis, getRedisClient }

