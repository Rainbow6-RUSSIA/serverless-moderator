import { execSync } from "child_process";
import pkg from "fs-extra";
import { join } from "path";

const {
    copySync,
    mkdtempSync,
    rmSync,
    readJSONSync,
    writeJSONSync,
    writeFileSync,
} = pkg;

// cd dist && zip -r bundle.zip ./**/*.js && zip -j -r bundle.zip ../package.json
const tmp = mkdtempSync("bundle-");
const manifest = readJSONSync("package.json");
manifest.type = "commonjs";

copySync("dist", join(tmp, "esm"), {
    recursive: true,
    filter: (src) => !src.endsWith(".js.map"),
});
writeJSONSync(join(tmp, "package.json"), manifest, { spaces: 2 });
writeJSONSync(join(tmp, "esm", "package.json"), { type: "module" });

writeFileSync(
    join(tmp, "index.js"),
    `module.exports.handler = async (event, ctx) => (await import("./esm/index.js")).handler(event, ctx)`
);

execSync(`cd ${tmp} && zip -r ../dist/bundle.zip *`);
rmSync(tmp, { force: true, recursive: true });
