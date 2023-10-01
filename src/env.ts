import { config } from "dotenv";
import z from "zod";
import "./util/polyfill.js";

const isDev = process.env.NODE_ENV === "development";

config({ path: isDev ? ".env" : ".env.production" });

const transformEnv = (env: NodeJS.ProcessEnv) =>
  Object.fromEntries(
    Object.entries(env).map(([k, v]) => {
      try {
        const val = JSON.parse(v ?? "undefined");
        if (
          typeof val === "number" &&
          (val >= Number.MAX_SAFE_INTEGER || val <= Number.MIN_SAFE_INTEGER)
        )
          throw new RangeError("Integer overflow");
        return [k, val];
      } catch (err) {
        return [k, v];
      }
    }),
  );

const schema = z.object({
  DEV: z.boolean().default(isDev),

  DISCORD_PUBLIC_KEY: z.string(),
  DISCORD_TOKEN: z.string(),
  DISCORD_GUILDS: z.array(z.string()).default([]),

  DB_ACCESS_KEY_ID: z.string().optional(),
  DB_SECRET_ACCESS_KEY: z.string().optional(),
  DB_REGION: z.string().optional().default("ru-central1-a"),
  DB_ENDPOINT: z.string().optional(),

  HIGHLIGHT_WEBHOOK: z.string().url(),
  HIGHLIGHT_FORUM_POST: z.string().optional(),
});

export const env = schema.parse(transformEnv(process.env));
Object.assign(process.env, env);
