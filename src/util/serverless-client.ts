import { Store } from "@sapphire/pieces";
import { Client, ListenOptions } from "@skyra/http-framework";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { isDev } from "./env.js";

if (isDev) Store.logger = console.log;

export class ServerlessClient extends Client {
    listen(options: ListenOptions): Promise<void> {
        throw new Error("Unsupported in serverless environment");
    }

    async plugin(fastify: FastifyInstance) {
        this.server = fastify;
        this.server.post("/", this.handleHttpMessage.bind(this));
    }
}
