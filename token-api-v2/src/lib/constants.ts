export const ONE_INCH_TOKEN_BASE_URL = "https://api.1inch.dev/token";

export const MAINNET_CHAIN_IDS = {
	BASE: 8453,
	LISK: 1135,
} as const;

export const MAINNET_CHAINS = Object.values(MAINNET_CHAIN_IDS);

// 1inch only supports certain chains - Lisk is not supported
export const ONE_INCH_SUPPORTED_CHAINS = [MAINNET_CHAIN_IDS.BASE] as const;

export type MainnetChainId = (typeof MAINNET_CHAINS)[number];
