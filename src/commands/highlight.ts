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
  WebhookMessageCreateOptions,
  messageLink,
} from "discord.js";
import { env } from "../env.js";

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
    { message }: TransformedArguments.Message
  ) {
    const { reactions = [], content, attachments, author } = message;
    const defer = await interaction.defer();

    const identity = {
      avatarURL:
        (author.avatar &&
          this.container.rest.cdn.avatar(author.id, author.avatar)) ??
        undefined,
      username: author.global_name ?? author.username,
    };
    await this.send({
      content,
      files: attachments.map((a) => new Attachment(a)),
      ...identity,
    });
    const note = await this.send({
      embeds: [this.getNote(message, interaction.user)],
      ...identity,
    });
    await Promise.allSettled([
      ...reactions.map((r) => this.react(note, r.emoji)),
      this.react(message, { id: null, name: "🌟" }),
    ]);

    return defer.update({
      content: `Успех!\n${messageLink(note.channel_id, note.id)}`,
    });
  }

  async react(message: APIMessage, emoji: APIEmoji) {
    const emojiId = emoji.id
      ? `${emoji.animated ? "a:" : ""}${emoji.name}:${emoji.id}`
      : encodeURIComponent(emoji.name!);

    return this.container.rest.put(
      Routes.channelMessageOwnReaction(message.channel_id, message.id, emojiId)
    );
  }

  async send(message: WebhookMessageCreateOptions) {
    return webhook.send({
      ...message,
      allowedMentions: {},
      threadId: env.HIGHLIGHT_FORUM_POST,
    });
  }

  getNote(
    { channel_id, author, id, timestamp, reactions = [] }: APIMessage,
    reposter: APIUser
  ) {
    const note = `Автор: <@${author.id}>\n${messageLink(channel_id, id)}`;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: reposter.global_name ?? reposter.username,
        iconURL:
          (reposter.avatar &&
            this.container.rest.cdn.avatar(reposter.id, reposter.avatar)) ??
          undefined,
        url: "https://discord.com/users/" + reposter.id,
      })
      .setDescription(note)
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
    return embed.toJSON();
  }
}
