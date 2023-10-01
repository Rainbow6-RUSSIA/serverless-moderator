import ffi from "ffi-napi";
import os from "os";
import path from "path";
import { isMainThread, parentPort } from "worker_threads";

export function prefix() {
  switch (os.type()) {
    case "Darwin":
      return "dylib";
    case "Linux":
      return "so";
    case "Windows_NT":
      return "dll";
    default:
      throw new Error("Unsupported OS");
  }
}

if (!isMainThread) {
  const lib = path.join(process.cwd(), "lib", `libr6dissect.${prefix()}`);
  const dissect = ffi.Library(lib, {
    dissect_read: ["string", ["string"]],
  });

  parentPort?.on("message", (file) =>
    parentPort?.postMessage(JSON.parse(dissect.dissect_read(file) ?? "null"))
  );
}

export const script = new URL(import.meta.url);
