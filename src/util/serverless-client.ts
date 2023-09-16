import { Store } from "@sapphire/pieces";
import { Client, ListenOptions } from "@skyra/http-framework";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { discordPublicKey, isDev } from "./env.js";
import { APIInteraction } from "discord.js";
import { verifyKeyMiddleware } from "discord-interactions";

if (isDev) Store.logger = console.log;

export class ServerlessClient extends Client {
  async listen(_: ListenOptions) {
    throw new Error("Unsupported in serverless environment");
  }

  async handle(req: FastifyRequest, res: FastifyReply) {
    res.hijack();
    return this.handleHttpMessage(req.body as APIInteraction, res.raw);
  }

  async plugin(fastify: FastifyInstance) {
    fastify.use(verifyKeyMiddleware(discordPublicKey));
    fastify.post("/", this.handle.bind(this));
    this.server = fastify.server;
  }
}
