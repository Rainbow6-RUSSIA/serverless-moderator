import {
  Command,
  RegisterMessageCommand,
  RestrictGuildIds,
  TransformedArguments,
} from "@skyra/http-framework";
import ContentDisposition from "content-disposition";
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
} from "discord.js";
import fetch from "node-fetch";
import { env } from "../env.js";
import { isTruthy } from "../util/predicates.js";

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
    await this.react(data.message, { id: null, name: "🌟" });

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
      .setDescription(this.getNote(message))
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
      files: await this.getAttachments(message),
    });
  }

  getAttachments(message: APIMessage): Promise<Attachment[]> {
    return Promise.allSettled([
      ...message.attachments.map((a) => new Attachment(a)),
      ...message.embeds
        .filter((e) => (e.video || e.thumbnail) && e.url)
        .map((e) => this.probeFile(e.url!)),
    ]).then((attachments) =>
      attachments
        .map((a) => a.status === "fulfilled" && a.value)
        .filter(isTruthy)
    );
  }

  getNote(message: APIMessage) {
    return `Автор: <@${message.author.id}>\n${messageLink(
      message.channel_id,
      message.id
    )}`;
  }

  async probeFile(url: string): Promise<Attachment> {
    const { headers } = await fetch(url, { method: "OPTIONS" });
    const disposition = headers.get("content-disposition"),
      length = headers.get("content-length"),
      type = headers.get("content-type");
    const filename =
      (disposition &&
        ContentDisposition.parse(disposition).parameters.filename) ??
      new URL(url).pathname.split("/").at(-1) ??
      "file";

    return new Attachment({
      id: "",
      filename,
      size: parseInt(length ?? "0"),
      url,
      proxy_url: "",
      content_type: type ?? undefined,
    });
  }
}
