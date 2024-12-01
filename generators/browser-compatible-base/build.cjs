const packageJson = require("./package.json");
const { writeFile } = require("fs/promises");
const path = require("path");

lib_main();

async function lib_main() {
    process.chdir(path.join(__dirname, "lib"));

    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: packageJson.name,
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                main: "index.js",
                types: "index.d.ts",
                type: "module",
                files: ["*.js", "*.d.ts", "ast/", "project/", "readme/", "reference/", "utils/"],
                dependencies: {
                    "@fern-api/logger": "^0.4.24-rc1",
                    // Maybe we don't need these?
                    // "@fern-fern/generator-exec-sdk": "^0.0.898",
                },
                overrides: {
                    "@fern-api/logger": "^0.4.24-rc1"
                }
            },
            undefined,
            2
        )
    );
}
