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
    public override chatInputRun(
        interaction: Command.Interaction,
        { target }: Args
    ): Command.Response {
        const { username, discriminator } = target.user;
        return this.message({
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
