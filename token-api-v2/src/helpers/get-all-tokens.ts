import { getAsyncTokens, type Token } from "./get-async-tokens";
import { getKoanDefaultTokens } from "./get-default-tokens";

const createTokenId = (address: string, chainId: number): string =>
	`${address.toLowerCase()}:${chainId}`;

export const getAllTokens = async (env: Env): Promise<Token[]> => {
	const [asyncTokens, defaultTokens] = await Promise.all([
		getAsyncTokens(env),
		Promise.resolve(getKoanDefaultTokens()),
	]);

	const defaultWithIds: Token[] = defaultTokens.map((t) => ({
		...t,
		id: createTokenId(t.address, t.chainId),
	}));

	const tokenMap = new Map<string, Token>();
	for (const token of [...asyncTokens, ...defaultWithIds]) {
		if (!tokenMap.has(token.id)) {
			tokenMap.set(token.id, token);
		}
	}

	return Array.from(tokenMap.values());
};
