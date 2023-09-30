import {
  Command,
  RegisterCommand,
  RestrictGuildIds,
} from "@skyra/http-framework";
import { env } from "../env.js";

@RestrictGuildIds(env.DISCORD_GUILDS)
@RegisterCommand((cmd) =>
  cmd.setName("ping").setDescription("Runs a network connection test with me")
)
export class PingCommand extends Command {
  async chatInputRun(interaction: Command.ChatInputInteraction) {
    return interaction.reply({
      content: "Pong!",
    });
  }
}
