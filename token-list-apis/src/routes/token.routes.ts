import { Hono } from "hono";
import {
	getAllTokens,
	getTokensByChain,
	getTokenByAddress,
} from "../controllers/token.controller";

const tokenRoutes = new Hono();

// GET /tokens - Get all tokens
tokenRoutes.get("/", getAllTokens);

// GET /tokens/:chainId - Get tokens by chain ID
tokenRoutes.get("/:chainId", getTokensByChain);

// GET /tokens/:chainId/:address - Get specific token by chain and address
tokenRoutes.get("/:chainId/:address", getTokenByAddress);

export default tokenRoutes;
