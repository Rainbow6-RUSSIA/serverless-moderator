import {
  Command,
  RegisterMessageCommand,
  RestrictGuildIds,
  TransformedArguments,
} from "@skyra/http-framework";
import { MessageFlags, PermissionFlagsBits, WebhookClient } from "discord.js";
import { env } from "../env.js";

@RestrictGuildIds(env.DISCORD_GUILDS)
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
    const {
      attachments,
      author,
      components,
      content,
      embeds,
      mentions,
      reactions,
    } = data.message;
    const json = JSON.stringify(
      {
        attachments,
        author,
        components,
        content,
        embeds,
        mentions,
        reactions,
      },
      null,
      2
    );
    console.log(json, json.length);
    return interaction.reply({
      content: `\`\`\`json\n${json}\`\`\``,
      flags: MessageFlags.Ephemeral,
    });
  }
}
