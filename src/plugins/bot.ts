import { discordPublicKey } from "../util/env.js";
import { ServerlessClient } from "../util/serverless-client.js";

const client = new ServerlessClient({ discordPublicKey });
await client.load();

export default client.plugin.bind(client);
