import { Hono } from "hono";
import { runCheckpoint } from "./counter-contract";

type Bindings = {
	SECRET_KEY: string;
	RUN_TOKEN?: string; // optional simple auth token for manual trigger
};

const app = new Hono<{ Bindings: Bindings }>();
// const app = new Hono()

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/env", (c) => {
	const SECRET_KEY = c.env.SECRET_KEY;
	// Never expose secrets directly. Return a masked value for debugging only.
	const masked = SECRET_KEY
		? `${SECRET_KEY.startsWith("0x") ? "0x" : ""}****${SECRET_KEY.slice(-4)}`
		: "<unset>";
	return c.text(`SECRET_KEY: ${masked}`);
});

// Optional manual trigger route
// Use: POST /runCheckpoint with optional header "x-run-token" matching env.RUN_TOKEN
app.get("/runCheckpoint", async (c) => {
	// lightweight gate if RUN_TOKEN is configured
	const configuredToken = c.env.RUN_TOKEN;
	if (configuredToken) {
		const provided = c.req.header("x-run-token");
		if (!provided || provided !== configuredToken) {
			return c.json({ error: "Unauthorized" }, 401);
		}
	}

	const rawKey = c.env.SECRET_KEY;
	if (!rawKey) {
		return c.json({ error: "SECRET_KEY is not set" }, 500);
	}

	const normalizedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;


	try {
		const { txHash, offset } = await runCheckpoint(
			normalizedKey as `0x${string}`,
		);
		return c.json({ ok: true, txHash, offset: offset.toString() });
	} catch (err: any) {
		console.error("/runCheckpoint failed:", err);
		return c.json({ ok: false, error: String(err?.message ?? err) }, 500);
	}
});

export default {
	async scheduled(
		controller: ScheduledController,
		env: Bindings,
		ctx: ExecutionContext,
	) {
		// Validate and normalize private key
		const rawKey = env.SECRET_KEY;
	
		const normalizedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
		

		try {
			const { txHash, offset } = await runCheckpoint(
				normalizedKey as `0x${string}`,
			);
			console.log(`Checkpoint tx: ${txHash}, Offset: ${offset} seconds`);
		} catch (err) {
			console.error("Scheduled checkpoint failed:", err);
		}
	},
	async fetch(request: Request, env: Bindings) {
		return await app.fetch(request, env);
	},
};
