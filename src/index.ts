import serverless, { Application } from "serverless-http";
import fastify from "fastify";
import { isDev } from "./util/env.js";
import { bot, test } from "./plugins/index.js";

const app = fastify({ logger: isDev });

app.register(test, { prefix: "/test" });
app.register(bot, { prefix: "/bot" });
if (isDev) app.listen({ port: 3000 });

const serverlessApp = serverless(app as Application);
export const handler = serverlessApp;
