import { Hono } from "hono";
import { getTokens, getTokensByChainIds } from "../services/token-service";

const tokensRoute = new Hono<{ Bindings: Env }>();

tokensRoute.get("/", async (c) => {
	const chainIdParam = c.req.query("chainId");

	// console.log({ chainIdParam });

	if (chainIdParam) {
		const chainId = Number(chainIdParam);

		const tokens = await getTokensByChainIds(c.env, chainId);

		console.log({ tokens });
		return c.json({
			success: true,
			count: tokens.length,
			tokens,
		});
	}

	const tokens = await getTokens(c.env);
	return c.json({
		success: true,
		count: tokens.length,
		tokens,
	});
});

export default tokensRoute;
