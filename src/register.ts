import { env } from "./env.js";

import { Store } from "@sapphire/pieces";
import { Registry } from "@skyra/http-framework";

// MONKEY-PATCH AREA
Store.logger = console.log;

const registry = new Registry({
  token: env.DISCORD_TOKEN,
});

await registry.load();
await registry.registerGlobalCommands();
await registry.registerGuildRestrictedCommands();
