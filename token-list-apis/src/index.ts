import { Hono } from "hono";
import { cors } from "hono/cors";
import routes from "./routes";

const app = new Hono();

// CORS middleware
app.use(
	"/*",
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:5173",
			"https://koanprotocol.xyz",
			"https://www.koanprotocol.xyz",
		],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		exposeHeaders: ["Content-Length", "X-Requested-With"],
		maxAge: 86400,
		credentials: true,
	}),
);

// Mount all routes
app.route("/", routes);

export default app;
