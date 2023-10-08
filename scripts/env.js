import assert from "assert";
import { writeFileSync } from "fs";

const path = process.argv[2]
assert(path, "No path specified")
writeFileSync(
  path,
  Object.entries(process.env)
    .filter(e => e[0] && e[1] && !/\W/g.test(e[0]))
    .map(e => `${e[0]} = "${e[1].replace(/"/g, '\"')}"`)
    .join("\n")
)