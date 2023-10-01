import ffi from "ffi-napi";
import { isMainThread, parentPort } from "worker_threads";
import { env } from "../../env.js";

if (!isMainThread) {
  const dissect = ffi.Library(env.DISSECT_LIB, {
    dissect_read: ["string", ["string"]],
  });

  parentPort?.on(
    "message",
    (file) =>
      parentPort?.postMessage(JSON.parse(dissect.dissect_read(file) ?? "null")),
  );
}

export const script = new URL(import.meta.url);
