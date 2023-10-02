import { ChildProcess, fork } from "child_process";
import { rm, writeFile } from "fs/promises";
import fetch from "node-fetch";
import path from "path";
import { temporaryDirectory, temporaryWrite } from "tempy";
import {
  ParseStream,
  Entry as ZipEntry,
  Parse as ZipParse,
  ParseStream as ZipParseStream,
} from "unzipper";
import { fileURLToPath } from "url";
import { env } from "../../env.js";
import { ReplayResponse } from "./types";

let child: ChildProcess;

const notice =
  (...args: any[]) =>
  <T>(data: T) => {
    if (args.some((a) => typeof a === "string" && a.includes("%s")))
      console.log(...args, data);
    else console.log(...args);
    return data;
  };

const clean = (path: string) =>
  rm(path, { force: true, recursive: true, maxRetries: 2 }).then(() =>
    console.log("INFO Cleaned up %s", path),
  );

function init() {
  console.log("INFO No child, forking...");
  const script = fileURLToPath(new URL("./child.js", import.meta.url));
  return fork(script, { stdio: "inherit" })
    .on("close", notice("DEBUG Child closed %s"))
    .on("disconnect", notice("DEBUG Child disconnected"))
    .on("error", notice("ERROR Child error %s"))
    .on("spawn", notice("DEBUG Child spawned"));
}

export async function* dissect(
  url: string,
): AsyncGenerator<ReplayResponse | null, null, unknown> {
  if (!child || !child.connected || child.exitCode !== null) child = init();

  const { headers, body } = await fetch(url);
  const mime = headers.get("content-type");
  const file = headers.get("content-disposition");
  console.log(
    "DEBUG Fetched URL %s. MIME: %s, disposition: %s",
    url,
    mime,
    file,
  );

  if (!body) return null;
  let iterator;
  if (mime === "application/zip")
    iterator = readMatch(body.pipe(ZipParse({ forceStream: true })));
  else if (mime === "application/octet-stream" && file?.endsWith(".rec"))
    iterator = readRound(body);
  else return null;

  for await (const round of iterator) yield round;

  return null;

  async function read(path: string) {
    return new Promise((res) => {
      const timer = setTimeout(() => {
        console.log("DEBUG IPC timeout");
        res(null);
      }, 20 * 1000);
      child.once("message", (msg) => {
        clearTimeout(timer);
        res(msg);
      });
      console.log("DEBUG Sending read task via IPC");
      child.send(path);
    }).then(notice("DEBUG Got result via IPC"));
  }

  async function* readRound(rec: NodeJS.ReadableStream) {
    console.log("INFO Starting reading round");
    const tmp = await temporaryWrite(rec, { extension: "rec" });
    console.log("INFO Reading round from %s", tmp);
    yield read(tmp) as ReplayResponse;
    await clean(tmp);
  }

  async function* readMatch(zip: ParseStream) {
    console.log("INFO Starting reading match");
    const tmp = temporaryDirectory();

    console.log("INFO Extracting match into %s", tmp);
    const iter = zip.filter(
      (entry: ZipEntry) => entry.type === "File" && entry.path.endsWith(".rec"),
    ) as ZipParseStream & AsyncIterable<ZipEntry>;

    for await (const entry of iter) {
      const rec = path.join(tmp, path.basename(entry.path));
      await writeFile(rec, entry);
      console.log("INFO Extracted %s round, reading...", rec);
      yield read(rec) as ReplayResponse;
      if (!env.DEV) await clean(rec);
    }
    await clean(tmp);
  }
}
