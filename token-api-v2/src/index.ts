import { Hono } from "hono";
import routes from "./routes";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
	return c.json({
		message: "Koan Protocol Token API v2",
		endpoints: {
			tokens: "/tokens",
			tokensByChain: "/tokens?chainIds=8453,1135",
		},
	});
});

app.route("/", routes);

export default app;
