const { pnpPlugin } = require("@yarnpkg/esbuild-plugin-pnp");
const { build } = require("esbuild");
const path = require("path");
const { chmod, writeFile, mkdir } = require("fs/promises");

const packageJson = require("./package.json");
const jsoncParserResolverPlugin = require("./jsoncParserResolverPlugin.cjs");

main();

async function main() {
    const options = {
        platform: "node",
        target: "node14",
        entryPoints: ["./src/cli.ts"],
        outfile: "./dist/dev/bundle.cjs",
        bundle: true,
        external: ["cpu-features"],
        plugins: [jsoncParserResolverPlugin, pnpPlugin()],
        define: {
            "process.env.CLI_NAME": JSON.stringify("fern-dev"),
            "process.env.CLI_VERSION": JSON.stringify(packageJson.version),
            "process.env.CLI_PACKAGE_NAME": JSON.stringify("@fern-api/fern-api-dev"),
            "process.env.AUTH0_DOMAIN": getEnvironmentVariable("AUTH0_DOMAIN"),
            "process.env.AUTH0_CLIENT_ID": getEnvironmentVariable("AUTH0_CLIENT_ID"),
            "process.env.DEFAULT_FIDDLE_ORIGIN": getEnvironmentVariable("DEFAULT_FIDDLE_ORIGIN"),
            "process.env.DEFAULT_VENUS_ORIGIN": getEnvironmentVariable("DEFAULT_VENUS_ORIGIN"),
            "process.env.DEFAULT_FDR_ORIGIN": getEnvironmentVariable("DEFAULT_FDR_ORIGIN"),
            "process.env.VENUS_AUDIENCE": getEnvironmentVariable("VENUS_AUDIENCE"),
            "process.env.LOCAL_STORAGE_FOLDER": getEnvironmentVariable("LOCAL_STORAGE_FOLDER"),
            "process.env.POSTHOG_API_KEY": getEnvironmentVariable("POSTHOG_API_KEY"),
            "process.env.DOCS_DOMAIN_SUFFIX": getEnvironmentVariable("DOCS_DOMAIN_SUFFIX"),
            "process.env.DOCS_PREVIEW_BUCKET": getEnvironmentVariable("DOCS_PREVIEW_BUCKET")
        }
    };

    function getEnvironmentVariable(environmentVariable) {
        const value = process.env[environmentVariable];
        if (value != null) {
            return JSON.stringify(value);
        }
        throw new Error(`Environment variable ${environmentVariable} is not defined.`);
    }

    await build(options).catch(() => process.exit(1));

    process.chdir(path.join(__dirname, "dist/dev"));

    // write cli executable
    await writeFile(
        "cli.cjs",
        `#!/usr/bin/env node

require("./bundle.cjs");`
    );
    await chmod("cli.cjs", "755");

    // write cli's package.json
    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: "@fern-api/fern-api-dev",
                version: packageJson.version,
                repository: packageJson.repository,
                files: ["bundle.cjs", "cli.cjs"],
                bin: { "fern-dev": "cli.cjs" }
            },
            undefined,
            2
        )
    );

    // write empty yarn.lock so yarn doesn't try to associate this package with the monorepo
    await writeFile("yarn.lock", "");

    // install package into new yarn.lock
    // YARN_ENABLE_IMMUTABLE_INSTALLS=false so we can modify yarn.lock even when in CI
    const { exec } = require("child_process");
    exec("YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install", undefined, (error) => {
        if (error != null) {
            console.error(error);
            process.exit(1);
        }
    });
}
