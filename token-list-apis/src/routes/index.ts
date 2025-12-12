import { Hono } from "hono";
import tokenRoutes from "./token.routes";
import balanceRoutes from "./balance.routes";
import testRoutes from "./test.routes";

const routes = new Hono();

// Mount all routes
routes.route("/tokens", tokenRoutes);
routes.route("/balances", balanceRoutes);
routes.route("/testing", testRoutes);

export default routes;
