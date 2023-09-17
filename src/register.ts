import { discordToken } from "./util/env.js";
import {
  Registry,
  CommandStore,
  InteractionHandlerStore,
} from "@skyra/http-framework";
import { container, Store } from "@sapphire/pieces";

// MONKEY-PATCH AREA
Store.logger = console.log;
container.stores.register(new CommandStore());
container.stores.register(new InteractionHandlerStore());

const registry = new Registry({
  token: discordToken,
});

await registry.load();
await registry.registerGlobalCommands();
await registry.registerGuildRestrictedCommands();
