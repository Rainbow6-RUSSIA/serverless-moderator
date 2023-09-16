import { Store } from "@sapphire/pieces";
import { Client, ListenOptions } from "@skyra/http-framework";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { discordPublicKey, isDev } from "./env.js";
import { APIInteraction } from "discord.js";
import { verifyKey } from "discord-interactions";

if (isDev) Store.logger = console.log;

export class ServerlessClient extends Client {
  async listen(_: ListenOptions) {
    throw new Error("Unsupported in serverless environment");
  }

  async handle(req: FastifyRequest, res: FastifyReply) {
    const signature = req.headers["x-signature-ed25519"] as string;
    const timestamp = req.headers["x-signature-timestamp"] as string;
    const isValidRequest = verifyKey(
      req.rawBody,
      signature,
      timestamp,
      discordPublicKey
    );
    if (!isValidRequest) {
      return res.status(401).send("Bad request signature");
    }
    
    res.hijack();
    res.raw.setHeader("Content-Type", "application/json");
    return this.handleHttpMessage(req.body as APIInteraction, res.raw);
  }

  async plugin(fastify: FastifyInstance) {
    await fastify.register(import("fastify-raw-body"));
    fastify.post("/", this.handle.bind(this));
    this.server = fastify.server;
  }
}
