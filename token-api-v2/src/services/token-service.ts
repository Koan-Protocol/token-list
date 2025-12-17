import type { Token } from "../types/token";
import { deduplicateTokens } from "../types/token";
import {
	getFromCache,
	saveToCache,
	shouldRefreshCache,
	CACHE_KEYS,
} from "../lib/cache";
import { createRedisClient } from "../lib/upstash-redis";
import { filterExcludedTokens } from "../lib/constants";
import {
	type TokenProvider,
	lifiProvider,
	oneInchProvider,
	defaultProvider,
} from "../providers";

const providers: TokenProvider[] = [
	lifiProvider,
	oneInchProvider,
	defaultProvider,
];

const fetchFromAllProviders = async (env: Env): Promise<Token[]> => {
	const results = await Promise.all(
		providers.map((provider) => provider.fetch(env)),
	);
	return results.flat();
};

const fetchAndCacheUnvalidated = async (env: Env): Promise<Token[]> => {
	const allTokens = await fetchFromAllProviders(env);
	const deduplicated = deduplicateTokens(allTokens);

	// Filter out excluded tokens (native tokens, etc.)
	const filteredTokens = filterExcludedTokens(deduplicated);

	console.log(
		`Filtered out ${
			deduplicated.length - filteredTokens.length
		} excluded tokens (native tokens, etc.)`,
	);

	// Add position tracking for validation
	const tokensWithPosition = filteredTokens.map((token, index) => ({
		...token,
		pst: index,
	}));

	const redis = createRedisClient(env);

	await Promise.all([
		redis.set(
			CACHE_KEYS.UNVALIDATED_TOKENS,
			JSON.stringify(tokensWithPosition),
			{
				ex: 7 * 24 * 60 * 60, // 1 week
			},
		),
		saveToCache(env, CACHE_KEYS.LAST_SYNC, Date.now()),
	]);

	console.log(
		`Cached ${filteredTokens.length} unvalidated tokens with position tracking`,
	);

	// Return without pst for API response
	return filteredTokens;
};

export const getTokens = async (env: Env): Promise<Token[]> => {
	// 1. Try validated cache first (1 week TTL)
	const validated = await getFromCache<Token[]>(
		env,
		CACHE_KEYS.VALIDATED_TOKENS,
	);

	console.log({ validated });

	if (validated?.length) {
		console.log(`✅ Validated cache hit: ${validated.length} tokens`);
		return validated;
	}

	// 2. Check if we need to refresh unvalidated cache
	const needsRefresh = await shouldRefreshCache(env);

	console.log({ needsRefresh });

	if (!needsRefresh) {
		const unvalidated = await getFromCache<Token[]>(
			env,
			CACHE_KEYS.UNVALIDATED_TOKENS,
		);

		console.log({ unvalidated });
		
		if (unvalidated?.length) {
			console.log(`📦 Unvalidated cache hit: ${unvalidated.length} tokens`);
			// Remove pst before returning
			return unvalidated.map(({ pst, ...token }: any) => token);
		}
	}

	// 3. Fetch from providers and cache as unvalidated
	console.log("🔄 Cache miss - fetching from providers...");
	return fetchAndCacheUnvalidated(env);
};

export const getTokensByChainIds = async (
	env: Env,
	chainId: number,
): Promise<Token[]> => {
	const tokens = await getTokens(env);

	// console.log({ chainId, tokens2: tokens });
	return tokens.filter((t) => t.chainId === chainId);
};
