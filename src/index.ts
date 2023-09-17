import serverless, { Application } from "serverless-http";
import fastify from "fastify";
import { isDev } from "./util/env.js";
import { bot, test } from "./plugins/index.js";

const app = fastify({ logger: isDev });

await app.register(test, { prefix: "/test" });
await app.register(bot, { prefix: "/bot" });

if (isDev) {
  await app.register(import("@fastify/http-proxy"), {
    upstream: process.env.GW_UPSTREAM,
    prefix: "/remote",
  });

  app.listen({ port: 3000 });
}

const serverlessApp = serverless(app as Application);
export const handler = serverlessApp;
