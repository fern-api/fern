const packageJson = require("./package.json");
const aiPackageJson = require("../ai/package.json");
const tsup = require('tsup');
const { writeFile } = require("fs/promises");
const path = require("path");

main();

async function main() {
    await tsup.build({
        entry: ['src/cli.ts'],
        format: ['cjs'],
        minify: false,
        outDir: 'dist/local',
        sourcemap: true,
        external: ['@boundaryml/baml'],
        env: {
            AUTH0_DOMAIN: "fern-dev.us.auth0.com",
            AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
            DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev2.buildwithfern.com",
            DEFAULT_VENUS_ORIGIN: "https://venus-dev2.buildwithfern.com",
            DEFAULT_FDR_ORIGIN: "http://localhost:8080",
            OVERRIDE_FDR_ORIGIN: "http://localhost:8080",
            DEFAULT_FDR_LAMBDA_DOCS_ORIGIN: "https://ykq45y6fvnszd35iv5yuuatkze0rpwuz.lambda-url.us-east-1.on.aws",
            VENUS_AUDIENCE: "venus-dev",
            LOCAL_STORAGE_FOLDER: ".fern-local",
            POSTHOG_API_KEY: null,
            DOCS_DOMAIN_SUFFIX: "docs.dev.buildwithfern.com",
            DOCS_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle2.s3.amazonaws.com/',
            APP_DOCS_TAR_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle4.s3.amazonaws.com/',
            APP_DOCS_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle3.s3.amazonaws.com/',
            CLI_NAME: "fern-local",
            CLI_VERSION: process.argv[2] || packageJson.version,
            CLI_PACKAGE_NAME: "fern-api",
        },
    }); 

    process.chdir(path.join(__dirname, "dist/local"));
    
    // write cli's package.json
    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: "fern-api",
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                files: ["cli.cjs"],
                bin: { fern: "cli.cjs" },
                dependencies: {
                    "@boundaryml/baml": packageJson.devDependencies["@boundaryml/baml"]
                }
            },
            undefined,
            2
        )
    );
}