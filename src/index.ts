import express from "express";
import serverless from "serverless-http";
import { bot, test } from "./routes/index.js";
import { isDev } from "./util/env.js";

const app = express();

app.use("/test", test());
app.use("/bot", bot());

if (isDev) {
  app.listen({ port: 3000 });
}

export const handler = serverless(app);
