import { Store } from "@sapphire/pieces";
import { Client, ListenOptions } from "@skyra/http-framework";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { discordPublicKey, isDev } from "./env.js";
import { APIInteraction } from "discord.js";
import { verifyKey } from "discord-interactions";

if (isDev) Store.logger = console.log;

const schema = {
  headers: {
    type: "object",
    properties: {
      "x-signature-ed25519": { type: "string" },
      "x-signature-timestamp": { type: "string" },
    },
    required: ["x-signature-ed25519", "x-signature-timestamp"],
  },
};

export class ServerlessClient extends Client {
  async listen(_: ListenOptions) {
    throw new Error("Unsupported in serverless environment");
  }

  async handle(req: FastifyRequest, res: FastifyReply) {
    const signature = req.headers["x-signature-ed25519"] as string;
    const timestamp = req.headers["x-signature-timestamp"] as string;

    const isValidRequest = verifyKey(
      JSON.stringify(req.body),
      signature,
      timestamp,
      discordPublicKey
    );

    if (!isValidRequest) return res.status(401).send("Bad request signature");

    res.hijack();
    res.raw.setHeader("Content-Type", "application/json");
    return this.handleHttpMessage(req.body as APIInteraction, res.raw);
  }

  async plugin(fastify: FastifyInstance) {
    fastify.post("/", { schema }, this.handle.bind(this));
    this.server = fastify.server;
  }
}
