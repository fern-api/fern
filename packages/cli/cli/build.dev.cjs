const packageJson = require("./package.json");
const tsup = require('tsup');
const { writeFile } = require("fs/promises");
const path = require("path");

main();

async function main() {
    await tsup.build({
        entry: ['src/cli.ts'],
        format: ['cjs'],
        outDir: 'dist/dev',
        minify: false,
        env: {
            AUTH0_DOMAIN: "fern-dev.us.auth0.com",
            AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
            DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev2.buildwithfern.com",
            DEFAULT_VENUS_ORIGIN: "https://venus-dev2.buildwithfern.com",
            DEFAULT_FDR_ORIGIN: "https://registry-dev2.buildwithfern.com",
            VENUS_AUDIENCE: "venus-dev",
            LOCAL_STORAGE_FOLDER: ".fern-dev",
            POSTHOG_API_KEY: null,
            DOCS_DOMAIN_SUFFIX: "docs.dev.buildwithfern.com",
            DOCS_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle2.s3.amazonaws.com/',
            CLI_NAME: "fern-dev",
            CLI_VERSION: process.argv[2] || packageJson.version,
            CLI_PACKAGE_NAME: "@fern-api/fern-api-dev",
        },
    });

    process.chdir(path.join(__dirname, "dist/dev"));

    // write cli's package.json
    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: "@fern-api/fern-api-dev",
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                files: ["cli.cjs"],
                bin: { "fern-dev": "cli.cjs" }
            },
            undefined,
            2
        )
    );
}