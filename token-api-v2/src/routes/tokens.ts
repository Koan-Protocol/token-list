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
		// Map logoURI to logoUri for each token in the response
		const mappedTokens = tokens.map((token) => {
			if (token.logoURI) {
				const { logoURI, ...rest } = token;
				return { ...rest, logoUri: logoURI };
			}
			return token;
		});
		return c.json({
			success: true,
			count: mappedTokens.length,
			tokens: mappedTokens,
		});
	}

	const tokens = await getTokens(c.env);
	// Map logoURI to logoUri for each token in the response
	const mappedTokens = tokens.map((token) => {
		if (token.logoURI) {
			const { logoURI, ...rest } = token;
			return { ...rest, logoUri: logoURI };
		}
		return token;
	});
	return c.json({
		success: true,
		count: mappedTokens.length,
		tokens: mappedTokens,
	});
});

export default tokensRoute;
