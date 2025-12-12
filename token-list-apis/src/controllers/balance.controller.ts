import { Context } from "hono";
import { Address } from "viem";
import { ChainId } from "../config/wagmi";
import { getBalance, getBalances } from "../lib/wagmi-functions";

export const getTokenBalances = async (c: Context) => {
	const chainId = parseInt(c.req.param("chainId"));
	const address = c.req.param("address");

	console.log("address", address);

	const balances = await getBalances({
		userAddress: address as Address,
		chainId: chainId as ChainId,
	});

	console.log("balances", balances);

	// Convert BigInt values to strings to make them JSON-serializable
	const serializableBalances = balances.map((balance) => ({
		result: balance.result?.toString() || "0",
		status: balance.status,
	}));

	return c.json({ balances: serializableBalances });
};

export const getTokenBalance = async (c: Context) => {
	const chainId = parseInt(c.req.param("chainId"));
	const address = c.req.param("address");
	const tokenAddress = c.req.param("tokenAddress");

	const balance = await getBalance({
		address: address as Address,
		chainId: chainId as ChainId,
		tokenAddress: tokenAddress as Address,
	});

	return c.json({ balance: balance.toString() });
};
