import { Hono } from "hono";
import { getTokens, getTokensByChainIds } from "../services/token-service";

const tokensRoute = new Hono<{ Bindings: Env }>();

tokensRoute.get("/", async (c) => {
	const chainIdsParam = c.req.query("chainIds");

	if (chainIdsParam) {
		const chainIds = chainIdsParam
			.split(",")
			.map((id) => parseInt(id.trim(), 10))
			.filter((id) => !isNaN(id));

		const tokens = await getTokensByChainIds(c.env, chainIds);
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
