import {
  Command,
  RegisterCommand,
  RestrictGuildIds,
} from "@skyra/http-framework";
import { env } from "../env.js";
import { MessageFlags } from "discord.js";
import { setTimeout } from "timers/promises";

// TODO: serverless function + queue
/*
TODO: ephemeral ACK
{
    "type": 5,
    "data": {
        "flags": 64
    }
}

TODO: переделать chatInputRun в асинхронный генератор,
TODO: ответы дискорду отправлять через yield
таким образом можно выцеживать ответы дискорду для прерывания обработки взаимодействия
Вызов функции №1 отвечает на взаимодействие и в случае отложенного продолжения делает вызов №2
Вызов функции №2 делает дальнейшую работу

*/
@RestrictGuildIds(env.DISCORD_GUILDS)
@RegisterCommand((cmd) =>
  cmd
    .setName("heartbeat")
    .setDescription("Runs a network connection test with me"),
)
export class HeartbeatCommand extends Command {
  async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.reply({
      content: "Starting heartbeat",
      flags: MessageFlags.Ephemeral,
    });
    for (let i = 0; i < 600; i++) {
      await interaction.followup({
        content: "beat #" + i,
        flags: MessageFlags.Ephemeral,
      });
      await setTimeout(1000);
    }
  }
}
