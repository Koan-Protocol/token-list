import { Redis } from "@upstash/redis/cloudflare";

export const createRedisClient = (env: Env) => {
	return new Redis({
		url: env.UPSTASH_REDIS_REST_URL,
		token: env.UPSTASH_REDIS_REST_TOKEN,
	});
};

export const CACHE_KEYS = {
	ALL_TOKENS: "tokens:all",
	LAST_SYNC: "tokens:last_sync",
	UNVALIDATED_TOKENS: "tokens:unvalidated",
	VALIDATED_TOKENS: "tokens:validated",
	STAGING_VALIDATED_TOKENS: "tokens:validated:staging",
} as const;

export const CACHE_TTL_SECONDS = 72 * 60 * 60;
