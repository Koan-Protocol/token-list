import { Hono } from "hono";
import { getTokenPrice } from "../lib/token-price-providers";

const priceRoute = new Hono<{ Bindings: Env }>();

priceRoute.get("/", async (c) => {
	const address = c.req.query("address");
	const chainIdParam = c.req.query("chainId");

	if (!address) {
		return c.json({ success: false, error: "address is required" }, 400);
	}

	if (!chainIdParam) {
		return c.json({ success: false, error: "chainId is required" }, 400);
	}

	// Support explicit string IDs for non-EVM (e.g. solana) or numeric for EVM
	// Check if it's a number
	let chainId: number | string = parseInt(chainIdParam, 10);
	if (isNaN(chainId)) {
		// If NaN, use the string directly (e.g. "solana")
		chainId = chainIdParam.toLowerCase();
	}
	try {
		const price = await getTokenPrice(chainId, address);

		if (!price) {
			return c.json(
				{ success: false, error: "Price not found or invalid token/chain" },
				404,
			);
		}

		return c.json({
			success: true,
			data: price,
		});
	} catch (error) {
		console.error("Error fetching price:", error);
		return c.json({ success: false, error: "Internal server error" }, 500);
	}
});

export default priceRoute;
