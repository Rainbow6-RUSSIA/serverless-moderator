import {
  Command,
  RegisterMessageCommand,
  RestrictGuildIds,
  TransformedArguments,
} from "@skyra/http-framework";
import { MessageFlags, PermissionFlagsBits, WebhookClient } from "discord.js";
import { env } from "../env.js";

@RestrictGuildIds([env.DISCORD_GUILD])
export class HighlightCommand extends Command {
  @RegisterMessageCommand((cmd) =>
    cmd
      .setName("Content")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  )
  async messageContextMenuRun(
    interaction: Command.UserInteraction,
    data: TransformedArguments.Message
  ) {
    const { attachments, content, embeds, mentions } = data.message;
    return interaction.reply({
      content: `\`\`\`json\n${JSON.stringify(
        { attachments, content, embeds, mentions },
        null,
        2
      )}\`\`\``,
      flags: MessageFlags.Ephemeral,
    });
  }
}
