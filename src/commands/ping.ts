import {
    Command,
    RegisterCommand,
    RestrictGuildIds,
} from "@skyra/http-framework";

@RegisterCommand((builder) =>
    builder //
        .setName("ping")
        .setDescription("Runs a network connection test with me")
)
@RestrictGuildIds(["216649610511384576"])
export class UserCommand extends Command {
    async chatInputRun(
        interaction: Command.ChatInputInteraction
    ) {
        return interaction.reply({
            content: "Pong!",
        });
    }
}
