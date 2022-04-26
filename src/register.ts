import { config } from "dotenv";
import {
    Client,
    Registry,
    CommandStore,
    InteractionHandlerStore,
} from "@skyra/http-framework";
import { container, Store } from "@sapphire/pieces";

config();

// MONKEY-PATCH AREA
Store.logger = console.log;
container.stores.register(new CommandStore());
container.stores.register(new InteractionHandlerStore());

const registry = new Registry({
    token: process.env.DISCORD_TOKEN,
});

await registry.load();
await registry.registerGlobalCommands();
await registry.registerGuildRestrictedCommands();
