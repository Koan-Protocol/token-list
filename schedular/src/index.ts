import { Hono } from "hono";
import { runCheckpoint } from "./counter-contract";

type Bindings = {
	SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();
// const app = new Hono()

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/env", (c) => {
	const SECRET_KEY = c.env.SECRET_KEY;
	return c.text(SECRET_KEY);
});

export default {
	async scheduled(
		controller: ScheduledController,
		env: Bindings,
		ctx: ExecutionContext,
	) {
		const { txHash, offset } = await runCheckpoint(
			env.SECRET_KEY as `0x${string}`,
		);
		console.log(`Checkpoint tx: ${txHash}, Offset: ${offset} seconds`);
	},
	async fetch(request: Request, env: Bindings) {
		return await app.fetch(request, env);
	},
};
