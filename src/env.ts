import { config } from "dotenv";
import z from "zod";
import "./util/polyfill.js";
import os from "os";
import assert from "assert";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

const type = os.type().split("_")[0].toLowerCase();
const suffix = {
  darwin: "dylib",
  linux: "so",
  windows: "dll",
}[type];
const arch = {
  x64: "amd64",
  arm64: "arm64",
}[os.arch()];
assert(arch && suffix && type);

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

  DISSECT_LIB: z
    .string()
    .default(
      path.join(process.cwd(), "lib", `libr6dissect-${type}-${arch}.${suffix}`),
    ),
});

export const env = schema.parse(transformEnv(process.env));
Object.assign(process.env, env);
