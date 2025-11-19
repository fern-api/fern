import { writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import tsup from "tsdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf-8"));
const aiPackageJson = JSON.parse(await readFile(new URL("../ai/package.json", import.meta.url), "utf-8"));

import { writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import tsup from "tsdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf-8"));
const aiPackageJson = JSON.parse(await readFile(new URL("../ai/package.json", import.meta.url), "utf-8"));


main();

async function main() {
    await tsup.build({
        entry: ['src/cli.ts'],
        format: ['cjs'],
        outDir: 'dist/dev',
        minify: false,
        sourcemap: true,
        platform: 'node',
        target: 'node18',
        external: [
            '@boundaryml/baml',
            /^prettier(?:\/.*)?$/,
            /^prettier2(?:\/.*)?$/,
            /^vitest(?:\/.*)?$/,
            /^depcheck(?:\/.*)?$/,
            /^tsdown(?:\/.*)?$/,
            /^typescript(?:\/.*)?$/,
            /^@types\/.*$/,
        ],
        metafile: true,
        env: {
            AUTH0_DOMAIN: "fern-dev.us.auth0.com",
            AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
            DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev2.buildwithfern.com",
            DEFAULT_VENUS_ORIGIN: "https://venus-dev2.buildwithfern.com",
            DEFAULT_FDR_ORIGIN: "https://registry-dev2.buildwithfern.com",
            DEFAULT_FDR_LAMBDA_DOCS_ORIGIN: "https://ykq45y6fvnszd35iv5yuuatkze0rpwuz.lambda-url.us-east-1.on.aws",
            VENUS_AUDIENCE: "venus-dev",
            LOCAL_STORAGE_FOLDER: ".fern-dev",
            POSTHOG_API_KEY: null,
            DOCS_DOMAIN_SUFFIX: "docs.dev.buildwithfern.com",
            DOCS_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle2.s3.amazonaws.com/',
            APP_DOCS_TAR_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle4.s3.amazonaws.com/',
            APP_DOCS_PREVIEW_BUCKET: 'https://dev2-local-preview-bundle3.s3.amazonaws.com/',
            CLI_NAME: "fern-dev",
            CLI_VERSION: process.argv[2] || packageJson.version,
            CLI_PACKAGE_NAME: "@fern-api/fern-api-dev",
        },
    });

    process.chdir(join(__dirname, "dist/dev"));

    // write cli's package.json
    await writeFile(
        "package.json",
        JSON.stringify(
            {
                name: "@fern-api/fern-api-dev",
                version: process.argv[2] || packageJson.version,
                repository: packageJson.repository,
                files: ["cli.cjs"],
                bin: { "fern-dev": "cli.cjs" },
                dependencies: {
                    "@boundaryml/baml": packageJson.devDependencies["@boundaryml/baml"]
                }
            },
            undefined,
            2
        )
    );
}
