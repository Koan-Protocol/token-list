import { Hono } from "hono";
import {
	getTokenBalances,
	getTokenBalance,
} from "../controllers/balance.controller";

const balanceRoutes = new Hono();

// GET /balances/:chainId/:address - Get all token balances for a user on a chain
balanceRoutes.get("/:chainId/:address", getTokenBalances);

// GET /balances/:chainId/:address/:tokenAddress - Get specific token balance
balanceRoutes.get("/:chainId/:address/:tokenAddress", getTokenBalance);

export default balanceRoutes;
