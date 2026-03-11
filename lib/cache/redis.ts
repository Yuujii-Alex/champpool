import { Redis } from "@upstash/redis";

const DEFAULT_ANALYSIS_CACHE_TTL_SECONDS = 300;
const MAX_ANALYSIS_CACHE_TTL_SECONDS = 3600;

let cachedRedisClient: Redis | null | undefined;

function parseTtlSeconds(rawValue: string | undefined): number {
  const parsed = Number(rawValue ?? DEFAULT_ANALYSIS_CACHE_TTL_SECONDS);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_ANALYSIS_CACHE_TTL_SECONDS;
  }

  return Math.min(Math.floor(parsed), MAX_ANALYSIS_CACHE_TTL_SECONDS);
}

function getRedisClient(): Redis | null {
  if (cachedRedisClient !== undefined) {
    return cachedRedisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    cachedRedisClient = null;
    return cachedRedisClient;
  }

  cachedRedisClient = new Redis({ url, token });
  return cachedRedisClient;
}

export function getAnalysisCacheTtlSeconds(): number {
  return parseTtlSeconds(process.env.ANALYSIS_CACHE_TTL_SECONDS);
}

export function buildCacheKey(...segments: string[]): string {
  return segments.join(":");
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();

  if (!redis) {
    return null;
  }

  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.error("Redis cache read failed", error);
    return null;
  }
}

export async function setCachedJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const redis = getRedisClient();

  if (!redis) {
    return;
  }

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error("Redis cache write failed", error);
  }
}