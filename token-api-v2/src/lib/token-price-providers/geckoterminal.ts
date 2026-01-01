import type { TokenPrice, TokenPriceProvider } from "./types";
import { CHAIN_ID_TO_GECKOTERMINAL_SLUG } from "./chain-maps";

export class GeckoTerminalProvider implements TokenPriceProvider {
	name = "geckoterminal";

	async getPrice(
		chainId: number | string,
		tokenAddress: string,
	): Promise<TokenPrice | null> {
		const chainSlug = CHAIN_ID_TO_GECKOTERMINAL_SLUG[chainId];
		if (!chainSlug) {
			console.warn(`[GeckoTerminal] Unsupported chain ID: ${chainId}`);
			return null;
		}

		const url = `https://api.geckoterminal.com/api/v2/networks/${chainSlug}/tokens/${tokenAddress}/pools?page=1&sort=h24_volume_usd_liquidity_desc`;

		try {
			const response = await fetch(url, {
				headers: {
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				if (response.status === 404) return null;
				console.error(
					`[GeckoTerminal] API error: ${response.status} ${response.statusText}`,
				);
				return null;
			}

			const json = (await response.json()) as any;
			const data = json.data;

			if (!data || !Array.isArray(data) || data.length === 0) {
				return null;
			}

			const pool = data[0];
			const attributes = pool.attributes;

			if (!attributes || !attributes.token_price_usd) {
				return null;
			}

			return {
				tokenAddress,
				chainId,
				usdPrice: parseFloat(attributes.token_price_usd),
			};
		} catch (error) {
			console.error("[GeckoTerminal] Fetch error:", error);
			return null;
		}
	}
}

export const geckoTerminalProvider = new GeckoTerminalProvider();
