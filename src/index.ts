import express from "express";
import serverless from "serverless-http";
import { bot, test } from "./routes/index.js";
import { env } from "./util/env.js";
import morgan from "morgan";

const app = express();

app.use(morgan("tiny"));
app.use("/test", test());
app.use("/bot", bot());

if (env.DEV) {
  app.listen({ port: 3000 });
}

export const handler = serverless(app);
