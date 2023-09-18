import { config } from "dotenv";
import z from "zod";
import "./util/polyfill.js";

const isDev = process.env.NODE_ENV === "development";

config({ path: isDev ? ".env" : ".env.production" });

const parseEnv = (env: NodeJS.ProcessEnv) =>
  Object.fromEntries(
    Object.entries(env).map(([k, v]) => {
      try {
        // TODO: filter snowflakes
        throw new Error();
        return [k, JSON.parse(v ?? "undefined")];
      } catch (err) {
        return [k, v];
      }
    })
  );

const loadEnvWithSchema = <T extends z.ZodTypeAny>(schema: T) => {
  const preprocess = z.preprocess(parseEnv, schema);
  const env = preprocess.parse(process.env);
  schema.parse(process.env);
  return env;
};

const schema = z.object({
  DEV: z.boolean().default(isDev),

  DISCORD_PUBLIC_KEY: z.string(),
  DISCORD_TOKEN: z.string(),
  DISCORD_GUILD: z.string(),

  DB_ACCESS_KEY_ID: z.string().optional(),
  DB_SECRET_ACCESS_KEY: z.string().optional(),
  DB_REGION: z.string().optional().default("ru-central1-a"),
  DB_ENDPOINT: z.string().optional(),

  HIGHLIGHT_WEBHOOK: z.string().url(),
  HIGHLIGHT_FORUM_POST: z.string().optional(),
});

export const env = loadEnvWithSchema(schema);
