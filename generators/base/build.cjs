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
                main: "index.cjs",
                types: "index.d.ts",
                type: "module",
                files: ["*.js", "*.d.ts", "ast/", "project/", "readme/", "reference/", "utils/"],
                dependencies: {
                    "@fern-api/core-utils": "^0.15.0-rc63",
                    "@fern-api/fs-utils": "^0.15.0-rc63",
                    "@fern-api/logger": "^0.4.24-rc1",
                    "@fern-api/logging-execa": "^0.15.0-rc63",
                    // Maybe we don't need these?
                    // "@fern-fern/generator-cli-sdk": "0.0.17",
                    // "@fern-fern/generator-exec-sdk": "^0.0.898",
                    "js-yaml": "^4.1.0",
                    "lodash-es": "^4.17.21",
                    "tmp-promise": "^3.0.3"
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
