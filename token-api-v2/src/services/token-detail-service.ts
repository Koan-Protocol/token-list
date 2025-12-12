import {
	getTokenFromChain,
	type OnChainTokenData,
} from "../viem/helpers/get-token";
import { getTokensByChainIds } from "./token-service";
import { createTokenId } from "../types/token";

export interface TokenData {
	address: string;
	name: string;
	symbol: string;
	logoUrl: string;
	decimals: number;
}

export const getTokenDetails = async (
	env: Env,
	address: string,
	chainId: number,
): Promise<TokenData | null> => {
	const onChainData = await getTokenFromChain(address, chainId);

	if (!onChainData) {
		return null;
	}

	const tokens = await getTokensByChainIds(env, [chainId]);
	const tokenId = createTokenId(address, chainId);
	const cachedToken = tokens.find((t) => t.id === tokenId);

	return {
		address: onChainData.address,
		name: onChainData.name,
		symbol: onChainData.symbol,
		decimals: onChainData.decimals,
		logoUrl: cachedToken?.logoURI || "",
	};
};
