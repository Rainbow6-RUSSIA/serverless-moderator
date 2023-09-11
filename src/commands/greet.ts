import {
    Command,
    RegisterCommand,
    RestrictGuildIds,
    TransformedArguments,
} from "@skyra/http-framework";

@RestrictGuildIds(["216649610511384576"])
@RegisterCommand((comBuilder) =>
    comBuilder
        .setName("greet")
        .setDescription("Greets someone.")
        .addUserOption((argBuilder) =>
            argBuilder
                .setName("target")
                .setDescription("Target to greet.")
                .setRequired(true)
        )
)
export class UserCommand extends Command {
    async chatInputRun(
        interaction: Command.ChatInputInteraction,
        { target }: Args
    ) {
        const { username, discriminator } = target.user;
        return interaction.reply({
            content: `Hello, ${username}#${discriminator}`,
        });
        // return this.message({
        //     content: `Hello, <@${target.user.id}>`,
        //     allowed_mentions: { users: [target.user.id] },
        // });
    }
}

interface Args {
    target: TransformedArguments.User;
}
