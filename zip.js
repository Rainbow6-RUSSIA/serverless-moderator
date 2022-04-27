import { execSync } from "child_process";
import pkg from "fs-extra";
import { join } from "path";

const {
    copySync,
    rmSync,
    readJSONSync,
    writeJSONSync,
    writeFileSync,
    mkdirSync,
} = pkg;

function main() {
    // Создаем временную папку
    const tmp = "bundle";
    try {
        mkdirSync(tmp);
    } catch (error) {
        rmSync(tmp, { force: true, recursive: true });
        return main();
    }

    // Читаем зависимости
    const { dependencies } = readJSONSync("package.json");

    // Копируем собранный ESM код в esm пропуская мапы
    copySync("dist", join(tmp, "esm"), {
        recursive: true,
        filter: (src) => !src.endsWith(".js.map"),
    });

    // Пишем commandjs манифест с зависимостями и точкой входа
    writeJSONSync(join(tmp, "package.json"), {
        type: "commonjs",
        dependencies,
    });

    // Пишем вложенный esm манифест для переключения импортов
    writeJSONSync(join(tmp, "esm", "package.json"), {
        type: "module",
        main: "./index.js",
    });

    // Пишем обертку
    writeFileSync(
        join(tmp, "index.js"),
        `const handler = async (event,ctx) => (await import("./esm/index.js")).handler(event,ctx)
        if (process.env.NODE_ENV==="development") handler()
        process.chdir("esm")
        module.exports.handler=handler`
    );

    // Архивируем
    execSync(`cd ${tmp} && zip -r ../dist/bundle.zip *`);

    // Очистка
    rmSync(tmp, { force: true, recursive: true });
}

main();
