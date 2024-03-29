import express from "express";
import serverless from "serverless-http";
import { bot, test } from "./routes/index.js";
import { env } from "./env.js";
import morgan from "morgan";

const app = express();

app.use(morgan("tiny"));
app.use("/test", test());
app.use("/bot", bot());

if (env.DEV) {
  const { default: monitor } = await import("express-status-monitor");
  app.use(monitor());
  app.listen({ port: 3000 });
}

export const handler = serverless(app);
