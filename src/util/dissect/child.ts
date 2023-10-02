import ffi from "ffi-napi";
import { env } from "../../env.js";
import { fileURLToPath } from "url";

const dissect = ffi.Library(env.DISSECT_LIB, {
  dissect_read: ["string", ["string"]],
});

process.on("message", (file) => {
  if (!process.send || typeof file !== "string") process.exit(1);
  process.send(JSON.parse(dissect.dissect_read(file) ?? "null"));
});

export const script = fileURLToPath(import.meta.url);
