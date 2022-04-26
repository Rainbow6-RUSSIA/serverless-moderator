import { Client, ListenOptions } from "@skyra/http-framework";
import fastify, { FastifyInstance } from "fastify";

export class ServerlessClient extends Client {
    constructor(options: ClientOptions = {}) {
        super(options);

        this.server = fastify(options.serverOptions);
        this.server.post(
            options.postPath ?? process.env.HTTP_POST_PATH ?? "/",
            this.handleHttpMessage.bind(this)
        );

        this.handler = this.server;
    }

    listen(options: ListenOptions): Promise<void> {
        throw new Error("Unsupported in serverless environment");
    }

    handler: FastifyInstance;
}

type ClientOptions = Client.Options &
    Omit<Client.ListenOptions, "port" | "address">;
