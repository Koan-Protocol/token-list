import { Hono } from "hono";
import { getAllTokens } from "../helpers/get-all-tokens";
import type { Token } from "../helpers/get-async-tokens";

const tokensRoute = new Hono<{ Bindings: Env }>();

tokensRoute.get("/", async (c) => {
	const chainIdsParam = c.req.query("chainIds");

	let tokens: Token[] = await getAllTokens(c.env);

	if (chainIdsParam) {
		const chainIds = chainIdsParam
			.split(",")
			.map((id) => parseInt(id.trim(), 10))
			.filter((id) => !isNaN(id));

		if (chainIds.length > 0) {
			tokens = tokens.filter((t) => chainIds.includes(t.chainId));
		}
	}

	return c.json({
		success: true,
		count: tokens.length,
		tokens,
	});
});

export default tokensRoute;
