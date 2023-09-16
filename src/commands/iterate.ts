import {
  Command,
  RegisterCommand,
  RestrictGuildIds,
  TransformedArguments,
} from "@skyra/http-framework";

@RestrictGuildIds(["216649610511384576"])
@RegisterCommand((cmdBuilder) =>
  cmdBuilder
    .setName("iterate")
    .setDescription("Iterate channel messages")
    .addChannelOption((opt) =>
      opt
        .setName("channel")
        .setDescription("Channel to iterate")
        .setRequired(true)
    )
    .addIntegerOption((opt) => opt.setName("since").setDescription("Since"))
)
export class UserCommand extends Command {
  async chatInputRun(
    interaction: Command.ChatInputInteraction,
    { since, channel }: Args
  ) {
    return interaction.reply({
      content: `Iterate ${channel} since ${since}`,
    });
  }
}

interface Args {
  channel: TransformedArguments.Channel;
  since: number;
}
