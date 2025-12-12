import { Hono } from "hono";
import { cors } from "hono/cors";
import routes from "./routes";

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
		endpoints: {
			tokens: "/tokens",
			tokensByChain: "/tokens?chainIds=8453,1135",
			token: "/token?address=0x...&chainId=8453",
			validate: "POST /validate",
		},
	});
});

app.route("/", routes);

export default app;
