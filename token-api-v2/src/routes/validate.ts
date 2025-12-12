import { Hono } from "hono";
import { validateAllTokens } from "../services/token-validation-service";

const validateRoute = new Hono<{ Bindings: Env }>();

validateRoute.post("/", async (c) => {
	console.log("Starting token validation...");

	try {
		const result = await validateAllTokens(c.env);

		return c.json({
			success: true,
			message: "Token validation complete",
			result: {
				total: result.total,
				validated: result.validated,
				failed: result.failed,
				updated: result.updated,
				duration: `${(result.duration / 1000).toFixed(2)}s`,
				failedTokens: result.failedTokens,
			},
		});
	} catch (error) {
		console.error("Validation error:", error);
		return c.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			500,
		);
	}
});

validateRoute.get("/", async (c) => {
	return c.json({
		message: "Token validation endpoint",
		usage: "POST /validate to start validation",
		description:
			"Validates all tokens against blockchain, updates name/symbol/decimals from on-chain data",
	});
});

export default validateRoute;
