import {
  Command,
  RegisterCommand,
  RestrictGuildIds,
  TransformedArguments,
} from "@skyra/http-framework";
import { env } from "../env.js";
import { dissect } from "../util/dissect/index.js";
import {
  APIEmbed,
  APIEmbedField,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import type { Replay } from "../util/dissect/types.js";

@RestrictGuildIds(env.DISCORD_GUILDS)
@RegisterCommand((cmd) =>
  cmd
    .setName("replay")
    .setDescription("Analyze replay file")
    .addAttachmentOption((arg) =>
      arg
        .setName("file")
        .setDescription("round.rec/match.zip")
        .setRequired(true),
    ),
)
export class ReplayCommand extends Command {
  async chatInputRun(
    interaction: Command.ChatInputInteraction,
    { file }: Args,
  ) {
    const defer = await interaction.defer({ flags: MessageFlags.Ephemeral });

    let logs: string[] = [];
    async function log(...args: any[]) {
      const content = (body: string) => `Analyze log:\n\`\`\`\n${body}\`\`\``;
      logs.push(args.filter(Boolean).join(" "));
      await defer.update({
        content: content(logs.join("\n")),
      });
    }

    const dump = dissect(file.url);
    let i = 0;
    const embeds: APIEmbed[] = [];

    for await (const round of dump) {
      i++;
      if (!round?.data || round.error) {
        await log(
          `Unable to analyze round ${i}.`,
          round?.error && `Error: ${round.error}`,
        );
        continue;
      }
      await log(`Round ${i} analyze complete!`);
      embeds.push(this.getRoundEmded(round.data));
    }

    while (embeds.length) {
      await defer.interaction.followup({
        embeds: embeds.splice(0, 4),
      });
    }
  }

  getRoundEmded(round: Replay) {
    const observer = round.players.find(
      (p) => p.id === round.recordingPlayerID,
    );
    const winner = round.teams.find((t) => t.won);

    const fields: APIEmbedField[] = [
      {
        name: "Version",
        value: [round.gameVersion, round.codeVersion].join("/"),
      },
      {
        name: "Playing On",
        value: [
          this.getLink(round.map.name, this.getMapURL(round.map.name)),
          round.matchType.name,
          round.gamemode.name,
        ].join(" // "),
      },
      {
        name: "Recording Player",
        value: this.getLink(
          observer?.username,
          this.getTrackerURL(observer?.profileID),
        ),
      },
      ...round.teams.map((team, index) => ({
        name: `${team.name}: ${team.role}`,
        value: round.players
          .filter((p) => p.teamIndex === index)
          .map((p) =>
            [
              p.operator.name,
              this.getLink(p.username, this.getTrackerURL(p.profileID)),
            ].join(" - "),
          )
          .join("\n"),
        inline: true,
      })),
      { name: "Match ID", value: round.matchID },
    ];

    const currentRound =
      round.roundNumber + Math.max(round.overtimeRoundNumber, 1);

    return new EmbedBuilder()
      .setTitle(
        `Round ${currentRound} of ${round.roundsPerMatch}+${round.roundsPerMatchOvertime}`,
      )
      .setDescription(
        `${winner?.name} won round ${currentRound} on ${winner?.role} by ${winner?.winCondition}`,
      )
      .addFields(fields)
      .setTimestamp(new Date(round.timestamp))
      .toJSON();
  }

  getLink(name?: string, url?: string) {
    return `[${name}](${url})`;
  }

  getMapURL(name: string) {
    return `https://ubisoft.com/en-us/game/rainbow-six/siege/game-info/maps/${name.toLowerCase()}`;
  }

  getTrackerURL(id?: string) {
    return `https://r6.tracker.network/r6/search?name=${id}&platform=4`;
  }
}

interface Args {
  file: TransformedArguments.Attachment;
}
