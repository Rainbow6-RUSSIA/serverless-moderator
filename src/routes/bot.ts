import { env } from "../util/env.js";
import { ServerlessClient } from "../util/serverless-client.js";

const client = new ServerlessClient({
  discordPublicKey: env.DISCORD_PUBLIC_KEY,
});
await client.load();

export default client.handler.bind(client);
