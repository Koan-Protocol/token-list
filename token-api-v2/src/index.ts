import { Hono } from "hono";
import { cors } from "hono/cors";
import routes from "./routes";

export { TokenValidationSchedulers } from "./durable-objects/token-validators";

const app = new Hono<{ Bindings: Env }>();

app.use(
	"*",
	cors({
		origin: [
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"https://koanprotocol.xyz",
			"https://koanprotocol.com",
		],
		credentials: true,
	}),
);

app.get("/", (c) => {
	return c.json({
		message: "Koan Protocol Token API v2",
		version: "2.0.0",
		endpoints: {
			tokens: {
				all: "GET /tokens",
				byChain: "GET /tokens?chainIds=8453,1135",
				single: "GET /token?address=0x...&chainId=8453",
			},
			validation: {
				start: "POST /validate",
				status: "GET /validate/status",
				reset: "POST /validate/reset",
				info: "GET /validate",
			},
		},
		features: [
			"Multi-provider token aggregation (LiFi, 1inch, Default)",
			"Batch validation with Durable Objects & Alarms",
			"Two-tier caching (validated & unvalidated)",
			"On-chain verification via viem",
		],
	});
});

app.route("/", routes);

export default app;
