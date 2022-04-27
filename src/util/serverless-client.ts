import { Store } from "@sapphire/pieces";
import { Client, ListenOptions } from "@skyra/http-framework";
import fastify, { FastifyInstance } from "fastify";

const isDev = process.env.NODE_ENV === "development";

if (isDev) Store.logger = console.log;

export class ServerlessClient extends Client {
    constructor(options: ClientOptions = {}) {
        super(options);

        this.server = fastify({
            logger: isDev,
            ...options.serverOptions,
        });
        this.server.post(
            options.postPath ?? process.env.HTTP_POST_PATH ?? "/",
            this.handleHttpMessage.bind(this)
        );

        this.handler = this.server;

        if (isDev) super.listen({ port: 3000 });
    }

    listen(options: ListenOptions): Promise<void> {
        throw new Error("Unsupported in serverless environment");
    }

    handler: FastifyInstance;
}

type ClientOptions = Client.Options &
    Omit<Client.ListenOptions, "port" | "address">;
