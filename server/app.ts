import { Hono } from "hono/tiny";
import { createRequestHandler } from "react-router";
import apiV1 from "./routes/v1";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

// Create the React Router request handler *once* (outside request scope)
const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

const app = new Hono<{ Bindings: Env }>();

app.route("/api/v1", apiV1);

// Attach the React Router handler to all routes
app.all("*", async (c) => {
  const request = c.req.raw;
  const env = c.env;
  const ctx = c.executionCtx;

  // Call React Router’s handler with proper context
  return await requestHandler(request, {
    cloudflare: { env, ctx: ctx as ExecutionContext },
  });
});

const handler: ExportedHandler<Env> = {
  fetch: app.fetch,
};

export default handler;

export { Counter } from "./durable_objects/counter.do";
