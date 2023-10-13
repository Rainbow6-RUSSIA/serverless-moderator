import koffi from "koffi";
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
import { env } from "../../env.js";
import { ReplayResponse } from "./types";

const dissect_read = koffi
  .load(env.DISSECT_LIB)
  .cdecl("dissect_read", "str", ["str"]);

const clean = (path: string) =>
  rm(path, { force: true, recursive: true, maxRetries: 2 }).then(() =>
    console.log("INFO Cleaned up %s", path),
  );

async function read(path: string) {
  try {
    const res = dissect_read(path);
    if (!res) throw new Error();
    return JSON.parse(res);
  } catch (error) {
    return null;
  }
}

async function* readRound(rec: NodeJS.ReadableStream) {
  console.log("INFO Starting reading round");
  const tmp = await temporaryWrite(rec, { extension: "rec" });
  console.log("INFO Reading round from %s", tmp);
  yield read(tmp) as ReplayResponse | null;
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
    yield read(rec) as ReplayResponse | null;
    if (!env.DEV) await clean(rec);
  }
  await clean(tmp);
}

export async function* dissect(url: string) {
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

  if (mime === "application/zip")
    yield* readMatch(body.pipe(ZipParse({ forceStream: true })));
  else if (mime === "application/octet-stream" && file?.endsWith(".rec"))
    yield* readRound(body);

  return null;
}
