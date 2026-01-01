import type { TokenPrice, TokenPriceProvider } from "./types";
import { CHAIN_ID_TO_DEXSCREENER_SLUG } from "./chain-maps";

export class DexScreenerProvider implements TokenPriceProvider {
	name = "dexscreener";

	async getPrice(
		chainId: number | string,
		tokenAddress: string,
	): Promise<TokenPrice | null> {
		const chainSlug = CHAIN_ID_TO_DEXSCREENER_SLUG[chainId];
		if (!chainSlug) {
			console.warn(`[DexScreener] Unsupported chain ID: ${chainId}`);
			return null;
		}

		const url = `https://api.dexscreener.com/tokens/v1/${chainSlug}/${tokenAddress}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				console.error(
					`[DexScreener] API error: ${response.status} ${response.statusText}`,
				);
				return null;
			}

			const data = (await response.json()) as any[];
			if (!data || !Array.isArray(data) || data.length === 0) {
				return null;
			}

			// DexScreener returns pairs sorted by some metric (usually relevance/liquidity).
			// We take the first pair.
			const pair = data[0];

			if (!pair.priceUsd) {
				return null;
			}

			return {
				tokenAddress,
				chainId,
				usdPrice: parseFloat(pair.priceUsd), // priceUsd is string in response
			};
		} catch (error) {
			console.error("[DexScreener] Fetch error:", error);
			return null;
		}
	}
}

export const dexscreenerProvider = new DexScreenerProvider();
