import type { Token } from "../types/token";
import { deduplicateTokens } from "../types/token";
import {
	getFromCache,
	saveToCache,
	shouldRefreshCache,
	CACHE_KEYS,
} from "../lib/cache";
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

const fetchAndCache = async (env: Env): Promise<Token[]> => {
	const allTokens = await fetchFromAllProviders(env);
	const deduplicated = deduplicateTokens(allTokens);

	await Promise.all([
		saveToCache(env, CACHE_KEYS.ALL_TOKENS, deduplicated),
		saveToCache(env, CACHE_KEYS.LAST_SYNC, Date.now()),
	]);

	console.log(`Cached ${deduplicated.length} deduplicated tokens`);
	return deduplicated;
};

export const getTokens = async (env: Env): Promise<Token[]> => {
	const needsRefresh = await shouldRefreshCache(env);

	if (!needsRefresh) {
		const cached = await getFromCache<Token[]>(env, CACHE_KEYS.ALL_TOKENS);
		if (cached?.length) {
			console.log(`Cache hit: ${cached.length} tokens`);
			return cached;
		}
	}

	console.log("Cache miss or expired - fetching from providers...");
	return fetchAndCache(env);
};

export const getTokensByChainIds = async (
	env: Env,
	chainIds: number[],
): Promise<Token[]> => {
	const tokens = await getTokens(env);
	if (!chainIds.length) return tokens;
	return tokens.filter((t) => chainIds.includes(t.chainId));
};
