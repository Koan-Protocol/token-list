import { Hono } from "hono";
import tokensRoute from "./tokens";
import tokenRoute from "./token";
import validateRoute from "./validate";
import balanceRoute from "./balance";

const routes = new Hono<{ Bindings: Env }>();

routes.route("/tokens", tokensRoute);
routes.route("/token", tokenRoute);
routes.route("/validate", validateRoute);
routes.route("/balance", balanceRoute);

export default routes;
