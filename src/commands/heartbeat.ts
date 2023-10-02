import {
  Command,
  RegisterCommand,
  RestrictGuildIds,
} from "@skyra/http-framework";
import { env } from "../env.js";
import { MessageFlags } from "discord.js";
import { setTimeout } from "timers/promises";

@RestrictGuildIds(env.DISCORD_GUILDS)
@RegisterCommand((cmd) =>
  cmd
    .setName("heartbeat")
    .setDescription("Runs a network connection test with me"),
)
export class HeartbeatCommand extends Command {
  async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.reply({
      content: "Starting heartbeat",
      flags: MessageFlags.Ephemeral,
    });
    for (let i = 0; i < 600; i++) {
      await interaction.followup({
        content: "beat #" + i,
        flags: MessageFlags.Ephemeral,
      });
      await setTimeout(1000);
    }
  }
}
