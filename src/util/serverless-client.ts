import { Store } from "@sapphire/pieces";
import { Client, ListenOptions } from "@skyra/http-framework";
import { FastifyInstance } from "fastify";
import { isDev } from "./env.js";

if (isDev) Store.logger = console.log;

export class ServerlessClient extends Client {
    async listen(options: ListenOptions) {
        throw new Error("Unsupported in serverless environment");
    }

    async plugin(fastify: FastifyInstance) {
        fastify.post("/", this.handleHttpMessage.bind(this));
        this.server = fastify.server;
    }
}
