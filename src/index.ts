import serverless, { Application } from "serverless-http";
import { ServerlessClient } from "./util/serverless-client.js";

const client = new ServerlessClient({
    discordPublicKey: process.env.DISCORD_PUBLIC_KEY,
});
const serverlessApp = serverless(client.handler as Application);

client.server.get("/test", (_, res) => {
    res.send({ hello: "world" });
});

const loadedClient = client.load();

export async function handler(event, ctx) {
    await loadedClient;
    return serverlessApp(event, ctx);
}
