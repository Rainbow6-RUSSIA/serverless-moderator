import fetch from "node-fetch";
import { temporaryDirectoryTask, temporaryWriteTask } from "tempy";
import {
  ParseStream,
  Entry as ZipEntry,
  Parse as ZipParse,
  ParseStream as ZipParseStream,
} from "unzipper";
import { Worker } from "worker_threads";
import { MatchResponse, ReplayResponse } from "./types";
import { script } from "./worker.js";
import path from "path";
import { writeFile } from "fs/promises";

let worker: Worker;

export async function dissect(url: string) {
  worker ??= new Worker(script);

  const { headers, body } = await fetch(url);
  const mime = headers.get("content-type");
  const file = headers.get("content-disposition");

  if (!body) return;
  if (mime === "application/zip")
    return readMatch(body.pipe(ZipParse({ forceStream: true })));
  else if (mime === "application/octet-stream" && file?.endsWith(".rec"))
    return readRound(body);
  else return null;

  async function read(path: string) {
    return new Promise((res) => {
      worker.once("message", res);
      worker.postMessage(path);
    });
  }

  async function readRound(rec: NodeJS.ReadableStream) {
    return temporaryWriteTask(rec, (tmp) => {
      return read(tmp) as ReplayResponse;
    });
  }

  async function readMatch(zip: ParseStream): Promise<MatchResponse> {
    return temporaryDirectoryTask(async (tmp) => {
      const iter = zip.filter(
        (entry: ZipEntry) =>
          entry.type === "File" && entry.path.endsWith(".rec"),
      ) as ZipParseStream & AsyncIterable<ZipEntry>;

      for await (const entry of iter)
        await writeFile(path.join(tmp, path.basename(entry.path)), entry);

      return read(tmp) as MatchResponse;
    });
  }
}
