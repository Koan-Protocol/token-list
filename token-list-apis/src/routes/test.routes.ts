import { Hono } from "hono";
import { testTokenInfo } from "../controllers/token.controller";

const testRoutes = new Hono();

// GET /testing - Test token info endpoint
testRoutes.get("/", testTokenInfo);

export default testRoutes;
