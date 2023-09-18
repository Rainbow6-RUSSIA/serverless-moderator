import { Store } from "@sapphire/pieces";
import { Client, ListenOptions } from "@skyra/http-framework";
import { verifyKeyMiddleware } from "discord-interactions";
import { Router } from "express";
import { env } from "./env.js";
import { APIEmoji, APIMessage } from "discord.js";

if (env.DEV) Store.logger = console.log;

export class ServerlessClient extends Client {
  async listen(_: ListenOptions) {
    throw new Error("Unsupported in serverless environment");
  }

  handler() {
    const router = Router();
    router.post(
      "/",
      verifyKeyMiddleware(env.DISCORD_PUBLIC_KEY),
      (req, res) => {
        res.setHeader("Content-Type", "application/json");
        return this.handleHttpMessage(req.body, res);
      }
    );
    return router;
  }
}
