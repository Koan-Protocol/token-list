import { Chain, createPublicClient,  http } from "viem";

export const createViemPublicClient = (_chain: Chain, _RPC_URL: string) =>
	createPublicClient({
		chain: _chain,
		transport: http(),
		cacheTime: 10_000,
	});

