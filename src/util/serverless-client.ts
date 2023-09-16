import { Store } from "@sapphire/pieces";
import { Client, ListenOptions } from "@skyra/http-framework";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { discordPublicKeyObject, isDev } from "./env.js";

if (isDev) Store.logger = console.log;

export class ServerlessClient extends Client {
  async listen(_: ListenOptions) {
    throw new Error("Unsupported in serverless environment");
  }

  async handle(req: FastifyRequest, res: FastifyReply) {
    res.hijack();
    return this.handleRawHttpMessage(
      Object.assign(req.raw, {
        async *[Symbol.asyncIterator]() {
          yield JSON.stringify(req.body);
        },
      }),
      res.raw,
      req.url,
      discordPublicKeyObject
    );
  }

  async plugin(fastify: FastifyInstance) {
    fastify.post("/", this.handle.bind(this));
    this.server = fastify.server;
  }
}
