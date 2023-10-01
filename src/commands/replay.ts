import {
  Command,
  RegisterCommand,
  RestrictGuildIds,
  TransformedArguments,
} from "@skyra/http-framework";
import { MessageFlags } from "discord.js";
import { env } from "../env.js";
import { dissect } from "../util/dissect/index.js";

@RestrictGuildIds(env.DISCORD_GUILDS)
@RegisterCommand((cmd) =>
  cmd
    .setName("replay")
    .setDescription("Analyze replay file")
    .addAttachmentOption((arg) =>
      arg.setName("file").setDescription(".rec round").setRequired(true)
    )
)
export class ReplayCommand extends Command {
  async chatInputRun(
    interaction: Command.ChatInputInteraction,
    { file }: Args
  ) {
    await interaction.defer();
    const dump = await dissect(file.url);
    return interaction.reply({
      content: `\`\`\`json\n${JSON.stringify(dump, null, 2)}\`\`\``,
    });
  }
}
interface Args {
  file: TransformedArguments.Attachment;
}
