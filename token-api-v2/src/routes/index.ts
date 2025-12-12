import { Hono } from "hono";
import tokensRoute from "./tokens";

const routes = new Hono<{ Bindings: Env }>();

routes.route("/tokens", tokensRoute);

export default routes;
