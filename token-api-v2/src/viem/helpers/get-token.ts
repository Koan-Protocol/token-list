import { type Address, type Chain, erc20Abi } from "viem";
import { base, lisk, baseSepolia, liskSepolia } from "viem/chains";
import { createViemPublicClient } from "../config";

export interface OnChainTokenData {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
}

const chainConfigs: Record<number, { chain: Chain; rpcUrl: string }> = {
	8453: { chain: base, rpcUrl: "https://mainnet.base.org" },
	1135: { chain: lisk, rpcUrl: "https://rpc.api.lisk.com" },
	84532: { chain: baseSepolia, rpcUrl: "https://sepolia.base.org" },
	4202: { chain: liskSepolia, rpcUrl: "https://rpc.sepolia-api.lisk.com" },
};

export const getTokenFromChain = async (
	address: string,
	chainId: number,
): Promise<OnChainTokenData | null> => {
	const config = chainConfigs[chainId];
	if (!config) {
		console.error(`Unsupported chainId: ${chainId}`);
		return null;
	}

	try {
		const client = createViemPublicClient(config.chain, config.rpcUrl);

		const [name, symbol, decimals] = await Promise.all([
			client.readContract({
				address: address as Address,
				abi: erc20Abi,
				functionName: "name",
			}),
			client.readContract({
				address: address as Address,
				abi: erc20Abi,
				functionName: "symbol",
			}),
			client.readContract({
				address: address as Address,
				abi: erc20Abi,
				functionName: "decimals",
			}),
		]);

		return {
			address,
			name,
			symbol,
			decimals,
		};
	} catch (error) {
		console.error(`Failed to fetch token from chain ${chainId}:`, error);
		return null;
	}
};
