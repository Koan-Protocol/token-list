import { DurableObject } from "cloudflare:workers";

export class TokenValidationSchedulers extends DurableObject {
	state: DurableObjectState;
	env: Env;

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.state = state;
		this.env = env;
	}

	async fetch(request: Request): Promise<Response> {
		return this.jsonResponse({ ok: false, error: "Not found" }, 404);
	}

	async alarm() {}

	private jsonResponse(data: unknown, status = 200): Response {
		return new Response(JSON.stringify(data), {
			status,
			headers: { "Content-Type": "application/json" },
		});
	}
}
