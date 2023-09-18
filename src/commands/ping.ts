import {
  Command,
  RegisterCommand,
  RestrictGuildIds,
} from "@skyra/http-framework";

@RestrictGuildIds(["216649610511384576"])
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
