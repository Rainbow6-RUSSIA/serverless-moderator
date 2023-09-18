import {
  Command,
  RegisterMessageCommand,
  RestrictGuildIds,
  TransformedArguments,
} from "@skyra/http-framework";
import {
  APIEmoji,
  APIMessage,
  APIUser,
  Attachment,
  EmbedBuilder,
  PermissionFlagsBits,
  Routes,
  WebhookClient,
  messageLink,
  MessageManager
} from "discord.js";
import { env } from "../util/env.js";

const webhook = new WebhookClient({ url: env.HIGHLIGHT_WEBHOOK });

@RestrictGuildIds([env.DISCORD_GUILD])
export class HighlightCommand extends Command {
  @RegisterMessageCommand((cmd) =>
    cmd
      .setName("Highlight")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  )
  async messageContextMenuRun(
    interaction: Command.UserInteraction,
    data: TransformedArguments.Message
  ) {
    const { reactions = [] } = data.message;
    const defer = await interaction.defer();
    const repost = await this.repost(data.message, interaction.user);

    for (const reaction of reactions) await this.react(repost, reaction.emoji);

    return defer.update({
      content: `Успех!\n${messageLink(repost.channel_id, repost.id)}`,
    });
  }

  async react(message: APIMessage, emoji: APIEmoji) {
    const emojiId = emoji.id
      ? `${emoji.animated ? "a:" : ""}${emoji.name}:${emoji.id}`
      : encodeURIComponent(emoji.name!);
    try {
      await this.container.rest.put(
        Routes.channelMessageOwnReaction(
          message.channel_id,
          message.id,
          emojiId
        )
      );
    } catch (error) {}
  }

  async repost(message: APIMessage, reposter: APIUser) {
    const { content, timestamp, reactions = [], attachments } = message;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: reposter.global_name ?? reposter.username,
        iconURL:
          (reposter.avatar &&
            this.container.rest.cdn.avatar(reposter.id, reposter.avatar)) ??
          undefined,
        url: "https://discord.com/users/" + reposter.id,
      })
      .setDescription(this.getContent(message))
      .setTimestamp(new Date(timestamp));

    if (reactions.length)
      embed.addFields({
        name: "Реакции",
        value:
          reactions
            .map(
              (r) =>
                `${
                  r.emoji.id
                    ? `<:${r.emoji.animated ? "a:" : ""}${r.emoji.name}:${
                        r.emoji.id
                      }>`
                    : r.emoji.name
                } \`${r.count}\``
            )
            .join(", ") || "н/д",
      });

    return webhook.send({
      content,
      embeds: [embed.toJSON()],
      threadId: env.HIGHLIGHT_FORUM_POST,
      allowedMentions: {},
      files: attachments.map((a) => new Attachment(a)),
    });
  }

  getContent(message: APIMessage) {
    return `Автор: <@${message.author.id}>\n${messageLink(
      message.channel_id,
      message.id
    )}`;
  }
}
