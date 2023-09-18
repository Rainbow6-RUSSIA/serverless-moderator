import {
  Command,
  RegisterCommand,
  RestrictGuildIds,
} from "@skyra/http-framework";
import { env } from "../util/env.js";

@RestrictGuildIds([env.DISCORD_GUILD])
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
