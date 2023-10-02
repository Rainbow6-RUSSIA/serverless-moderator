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
import { ReplayResponse } from "./types";

const notice =
  (...args: any[]) =>
  <T>(data: T) => {
    if (args.some((a) => typeof a === "string" && a.includes("%s")))
      console.log(...args, data);
    else console.log(...args);
    return data;
  };
  
class DissectProcessor {
  get child(): ChildProcess {
    if (this._child && this._child.connected && this._child.exitCode === null)
      return this._child;
    console.log("INFO No child, forking...");
    const script = fileURLToPath(new URL("./child.js", import.meta.url));
    this._child = fork(script)
      .on("spawn", () => console.log("DEBUG Child spawned"))
      .on("disconnect", () => {
        console.log("DEBUG Child disconnected");
        this.kill();
      })
      .on("close", (code) => {
        console.log("DEBUG Child closed %s", code);
        this.kill();
      })
      .on("error", (err) => {
        console.log("ERROR Child error %s", err);
        this.kill();
      });
    return this._child;
  }

  kill() {
    try {
      this._child?.kill("SIGKILL");
    } catch (error) {}
    this._child = null;
  }

  async read(path: string) {
    return new Promise((res) => {
      const timer = setTimeout(() => {
        console.log("DEBUG IPC timeout");
        res(null);
      }, 20 * 1000);
      this.child.once("message", (msg) => {
        clearTimeout(timer);
        res(msg);
      });
      console.log("DEBUG Sending read task via IPC");
      this.child.send(path);
    }).then(notice("DEBUG Got result via IPC"));
  }

  readMatch = async function* (zip: ParseStream) {
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
      yield this.read(rec) as ReplayResponse;
    }

    await rm(tmp, { recursive: true, force: true, maxRetries: 2 });
    console.log("INFO Cleaned up temp directory");
  };

  readRound = async function* (rec: NodeJS.ReadableStream) {
    console.log("INFO Starting reading round");
    const tmp = await temporaryWrite(rec, { extension: "rec" });
    console.log("INFO Reading round from %s", tmp);
    yield this.read(tmp) as ReplayResponse;
    await rm(tmp, { recursive: true, force: true, maxRetries: 2 });
    console.log("INFO Cleaned up temp file");
  };

  process = async function* (
    url: string,
  ): AsyncGenerator<ReplayResponse | null, null, unknown> {
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
      iterator = this.readMatch(body.pipe(ZipParse({ forceStream: true })));
    else if (mime === "application/octet-stream" && file?.endsWith(".rec"))
      iterator = this.readRound(body);
    else return null;

    for await (const round of iterator) yield round;

    return null;
  };
  private _child: ChildProcess | null = null;
}

const singleton = new DissectProcessor();
export const dissect = singleton.process.bind(singleton);
