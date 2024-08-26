import { Hono } from "hono";
import { getTokenInfo } from "./lib/wagmi-functions";
import {
  getKoanDefaultTokens,
  getToken,
  getTokensByChainId,
} from "./lib/helpers";
import { ChainId, chainIds } from "./config/wagmi";
import { Address } from "viem";

const app = new Hono();

app.get("/tokens", (c) => {
  const allTokens = getKoanDefaultTokens();
  return c.json(allTokens);
});

app.get("/testing", async (c) => {
  try {
    const tokenInfo = await getTokenInfo();
    return c.json(tokenInfo);
  } catch (error) {
    console.error("Error fetching token info:", error);
    return c.json({ error: "Failed to fetch token info" }, 500);
  }
});

app.get("/tokens/:chainId", (c) => {
  const chainId = parseInt(c.req.param("chainId"));
  if (isNaN(chainId) || !chainIds.includes(chainId as ChainId)) {
    return c.json({ success: false, error: "Invalid chainId" }, 400);
  }
  const tokens = getTokensByChainId(chainId as ChainId);
  return c.json({
    success: true,
    chainId,
    tokenCount: tokens.length,
    tokens,
  });
});

app.get("/tokens/:chainId/:address", async (c) => {
  const chainId = parseInt(c.req.param("chainId"));
  const address = c.req.param("address");

  if (isNaN(chainId)) {
    return c.json({ success: false, error: "Invalid chainId" }, 400);
  }

  const token = await getToken({
    chainId: chainId as ChainId,
    address: address as Address,
  });

  if (!token) {
    return c.json({ success: false, error: "Token not found" }, 404);
  }
  console.log("token from fetchtoken", token);

  return c.json({
    success: true,
    token,
  });
});

export default app;
