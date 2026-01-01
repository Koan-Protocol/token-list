import { dexscreenerProvider } from "./dexscreener";
import { geckoTerminalProvider } from "./geckoterminal";
import type { TokenPrice } from "./types";

export async function getTokenPrice(
	chainId: number | string,
	tokenAddress: string,
): Promise<TokenPrice | null> {
	// Fetch from both providers in parallel
	const [dexScreenerResult, geckoTerminalResult] = await Promise.all([
		dexscreenerProvider.getPrice(chainId, tokenAddress),
		geckoTerminalProvider.getPrice(chainId, tokenAddress),
	]);

	// Priority: DexScreener -> GeckoTerminal
	if (dexScreenerResult) {
		return dexScreenerResult;
	}

	if (geckoTerminalResult) {
		return geckoTerminalResult;
	}

	return null;
}

export * from "./types";
export * from "./dexscreener";
export * from "./geckoterminal";
