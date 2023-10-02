import { ChildProcess, fork } from "child_process";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import path from "path";
import { temporaryDirectoryTask, temporaryWriteTask } from "tempy";
import {
  ParseStream,
  Entry as ZipEntry,
  Parse as ZipParse,
  ParseStream as ZipParseStream,
} from "unzipper";
import { MatchResponse, ReplayResponse } from "./types";
import { fileURLToPath } from "url";

let child: ChildProcess;

const notice =
  (...args: any[]) =>
  <T>(data: T) => {
    if (args.some((a) => typeof a === "string" && a.includes("%s")))
      console.log(...args, data);
    else console.log(...args);
    return data;
  };

function init() {
  console.log("INFO No child, forking...");
  const script = fileURLToPath(new URL("./child.js", import.meta.url));
  return fork(script, { stdio: "inherit" })
    .on("close", notice("DEBUG Child closed %s"))
    .on("disconnect", notice("DEBUG Child disconnected"))
    .on("error", notice("ERROR Child error %s"))
    .on("spawn", notice("DEBUG Child spawned"));
}

export async function dissect(url: string) {
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

  if (!body) return;
  if (mime === "application/zip")
    return readMatch(body.pipe(ZipParse({ forceStream: true })));
  else if (mime === "application/octet-stream" && file?.endsWith(".rec"))
    return readRound(body);
  else return null;

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

  async function readRound(rec: NodeJS.ReadableStream) {
    console.log("INFO Starting reading round");
    return temporaryWriteTask(
      rec,
      (tmp) => {
        console.log("INFO Extracting round into %s", tmp);
        return read(tmp) as ReplayResponse;
      },
      { extension: "rec" },
    ).then(notice("INFO Cleaned up temp file"));
  }

  async function readMatch(zip: ParseStream): Promise<MatchResponse> {
    console.log("INFO Starting reading match");
    return temporaryDirectoryTask(async (tmp) => {
      console.log("INFO Extracting match into %s", tmp);
      const iter = zip.filter(
        (entry: ZipEntry) =>
          entry.type === "File" && entry.path.endsWith(".rec"),
      ) as ZipParseStream & AsyncIterable<ZipEntry>;

      for await (const entry of iter) {
        const filename = path.basename(entry.path);
        await writeFile(path.join(tmp, filename), entry);
        console.log("INFO Extracted %s round", filename);
      }

      return read(tmp) as MatchResponse;
    }).then(notice("INFO Cleaned up temp directory"));
  }
}
