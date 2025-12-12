import { Context } from "hono";
import { Address } from "viem";
import { ChainId, chainIds } from "../config/wagmi";
import {
	getKoanDefaultTokens,
	getToken,
	getTokensByChainId,
} from "../lib/helpers";
import { getTokenInfo } from "../lib/wagmi-functions";

export const getAllTokens = (c: Context) => {
	const allTokens = getKoanDefaultTokens();
	return c.json(allTokens);
};

export const getTokensByChain = (c: Context) => {
	const chainId = parseInt(c.req.param("chainId"));

	if (isNaN(chainId) || !chainIds.includes(chainId as ChainId)) {
		return c.json({ success: false, error: "Invalid chainId" }, 400);
	}

	const tokens = getTokensByChainId(chainId as ChainId);

	return c.json({
		success: true,
		chainId,
		tokenCount: tokens.length,
		tokens,
	});
};

export const getTokenByAddress = async (c: Context) => {
	const chainId = parseInt(c.req.param("chainId"));
	const address = c.req.param("address");

	if (isNaN(chainId)) {
		return c.json({ success: false, error: "Invalid chainId" }, 400);
	}

	const token = await getToken({
		chainId: chainId as ChainId,
		address: address as Address,
	});

	if (!token) {
		return c.json({ success: false, error: "Token not found" }, 404);
	}

	console.log("token from fetchtoken", token);

	return c.json({
		success: true,
		token,
	});
};

export const testTokenInfo = async (c: Context) => {
	try {
		const tokenInfo = await getTokenInfo();
		return c.json(tokenInfo);
	} catch (error) {
		console.error("Error fetching token info:", error);
		return c.json({ error: "Failed to fetch token info" }, 500);
	}
};
