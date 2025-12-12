import { ChainId, getTokens } from "@lifi/sdk";
import {
	createRedisClient,
	CACHE_KEYS,
	CACHE_TTL_SECONDS,
} from "../lib/upstash-redis";
import {
	ONE_INCH_TOKEN_BASE_URL,
	ONE_INCH_SUPPORTED_CHAINS,
} from "../lib/constants";

export interface Token {
	id: string;
	chainId: number;
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	logoURI?: string;
}

type RawToken = Omit<Token, "id">;

const createTokenId = (address: string, chainId: number): string =>
	`${address.toLowerCase()}:${chainId}`;

const addTokenId = (token: RawToken): Token => ({
	...token,
	id: createTokenId(token.address, token.chainId),
});

const deduplicateTokens = (tokens: Token[]): Token[] => {
	const tokenMap = new Map<string, Token>();
	for (const token of tokens) {
		if (!tokenMap.has(token.id)) {
			tokenMap.set(token.id, token);
		}
	}
	return Array.from(tokenMap.values());
};

const fetchLifiTokens = async (): Promise<Token[]> => {
	try {
		const response = await getTokens({
			chains: [ChainId.BAS, ChainId.LSK],
		});

		const tokens: Token[] = [];
		for (const [chainId, chainTokens] of Object.entries(response.tokens)) {
			for (const t of chainTokens) {
				tokens.push(
					addTokenId({
						chainId: Number(chainId),
						address: t.address,
						name: t.name,
						symbol: t.symbol,
						decimals: t.decimals,
						logoURI: t.logoURI,
					}),
				);
			}
		}

		console.log(`LiFi: fetched ${tokens.length} tokens`);
		return tokens;
	} catch (error) {
		console.error("LiFi fetch error:", error);
		return [];
	}
};

const fetch1inchTokensForChain = async (
	chainId: number,
	apiKey: string,
): Promise<Token[]> => {
	try {
		const response = await fetch(
			`${ONE_INCH_TOKEN_BASE_URL}/v1.2/${chainId}/token-list?provider=1inch`,
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					accept: "application/json",
				},
			},
		);

		if (!response.ok) {
			console.error(`1inch: chain ${chainId} returned ${response.status}`);
			return [];
		}

		const data = (await response.json()) as
			| Array<unknown>
			| { tokens?: Array<unknown> };

		const tokenList = Array.isArray(data)
			? data
			: (data as { tokens?: Array<unknown> })?.tokens || [];

		if (!Array.isArray(tokenList)) {
			console.error(`1inch: unexpected response format for chain ${chainId}`);
			return [];
		}

		type OneInchToken = {
			address: string;
			name: string;
			symbol: string;
			decimals: number;
			logoURI?: string;
		};

		return (tokenList as OneInchToken[]).map((t) =>
			addTokenId({
				chainId,
				address: t.address,
				name: t.name,
				symbol: t.symbol,
				decimals: t.decimals,
				logoURI: t.logoURI,
			}),
		);
	} catch (error) {
		console.error(`1inch fetch error for chain ${chainId}:`, error);
		return [];
	}
};

const fetch1inchTokens = async (apiKey: string): Promise<Token[]> => {
	const results = await Promise.all(
		ONE_INCH_SUPPORTED_CHAINS.map((chainId) =>
			fetch1inchTokensForChain(chainId, apiKey),
		),
	);
	const tokens = results.flat();
	console.log(`1inch: fetched ${tokens.length} tokens`);
	return tokens;
};

const getFromCache = async <T>(env: Env, key: string): Promise<T | null> => {
	try {
		const redis = createRedisClient(env);
		const data = await redis.get<string>(key);
		if (!data) return null;
		return typeof data === "string" ? JSON.parse(data) : data;
	} catch {
		return null;
	}
};

const saveToCache = async <T>(
	env: Env,
	key: string,
	data: T,
): Promise<void> => {
	try {
		const redis = createRedisClient(env);
		await redis.set(key, JSON.stringify(data), { ex: CACHE_TTL_SECONDS });
	} catch (error) {
		console.error(`Cache save error for ${key}:`, error);
	}
};

const shouldRefreshCache = async (env: Env): Promise<boolean> => {
	const lastSync = await getFromCache<number>(env, CACHE_KEYS.LAST_SYNC);
	if (!lastSync) return true;
	const elapsed = Date.now() - lastSync;
	return elapsed > CACHE_TTL_SECONDS * 1000;
};

const fetchAndCacheFromSources = async (env: Env): Promise<Token[]> => {
	const [lifiTokens, oneInchTokens] = await Promise.all([
		fetchLifiTokens(),
		fetch1inchTokens(env.ONEINCH_API_KEY || ""),
	]);

	const allTokens = deduplicateTokens([...lifiTokens, ...oneInchTokens]);

	await Promise.all([
		saveToCache(env, CACHE_KEYS.ALL_TOKENS, allTokens),
		saveToCache(env, CACHE_KEYS.LAST_SYNC, Date.now()),
	]);

	console.log(`Cached ${allTokens.length} deduplicated tokens`);
	return allTokens;
};

export const getAsyncTokens = async (env: Env): Promise<Token[]> => {
	const needsRefresh = await shouldRefreshCache(env);

	if (!needsRefresh) {
		const cached = await getFromCache<Token[]>(env, CACHE_KEYS.ALL_TOKENS);
		if (cached?.length) {
			console.log(`Cache hit: ${cached.length} tokens`);
			return cached;
		}
	}

	console.log("Cache miss or expired - fetching from sources...");
	return fetchAndCacheFromSources(env);
};

export const getCachedTokens = getAsyncTokens;
