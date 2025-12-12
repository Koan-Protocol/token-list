import { Hono } from "hono";
import tokensRoute from "./tokens";
import tokenRoute from "./token";
import validateRoute from "./validate";

const routes = new Hono<{ Bindings: Env }>();

routes.route("/tokens", tokensRoute);
routes.route("/token", tokenRoute);
routes.route("/validate", validateRoute);

export default routes;
