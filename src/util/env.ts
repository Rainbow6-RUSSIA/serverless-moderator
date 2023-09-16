import assert from "assert";
import { config } from "dotenv";
// import { webcrypto } from "crypto";
import { webcrypto } from "./polyfill.js";

config();

export const isDev = process.env.NODE_ENV === "development";

export const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;
export const discordToken = process.env.DISCORD_TOKEN;

export const accessKeyId = process.env.DB_ACCESS_KEY_ID;
export const secretAccessKey = process.env.DB_SECRET_ACCESS_KEY;
export const region = process.env.DB_REGION ?? "ru-central1";
export const endpoint = process.env.DB_ENDPOINT;

assert(discordPublicKey, "No discordPublicKey");
// assert(accessKeyId, "No accessKeyId")
// assert(secretAccessKey, "No secretAccessKey")
// assert(region, "No region")
// assert(endpoint, "No endpoint")

export const discordPublicKeyObject = await webcrypto.subtle.importKey(
  "raw",
  Buffer.from(discordPublicKey, "hex"),
  { name: "EdDSA", namedCurve: "Ed25519" },
  true,
  ["verify"]
);
