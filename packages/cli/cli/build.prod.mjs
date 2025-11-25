import { buildCli, PRODUCTION_TSUP_OVERRIDES } from './build-utils.mjs';

buildCli({
    outDir: 'dist/prod',
    minify: true,
    env: {
        AUTH0_DOMAIN: "fern-prod.us.auth0.com",
        AUTH0_CLIENT_ID: "syaWnk6SjNoo5xBf1omfvziU3q7085lh",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator.buildwithfern.com",
        DEFAULT_VENUS_ORIGIN: "https://venus.buildwithfern.com",
        DEFAULT_FDR_ORIGIN: "https://registry.buildwithfern.com",
        DEFAULT_FDR_LAMBDA_DOCS_ORIGIN: "https://ykq45y6fvnszd35iv5yuuatkze0rpwuz.lambda-url.us-east-1.on.aws",
        VENUS_AUDIENCE: "venus-prod",
        LOCAL_STORAGE_FOLDER: ".fern",
        POSTHOG_API_KEY: process.env.POSTHOG_API_KEY ?? "",
        DOCS_DOMAIN_SUFFIX: "docs.buildwithfern.com",
        DOCS_PREVIEW_BUCKET: 'https://prod-local-preview-bundle2.s3.amazonaws.com/',
        APP_DOCS_TAR_PREVIEW_BUCKET: 'https://prod-local-preview-bundle4.s3.amazonaws.com/',
        APP_DOCS_PREVIEW_BUCKET: 'https://prod-local-preview-bundle3.s3.amazonaws.com/',
        CLI_NAME: "fern",
        CLI_PACKAGE_NAME: "fern-api",
    },
    runtimeDependencies: ['@boundaryml/baml', 'cli-progress'],
    packageJsonOverrides: {
        name: "fern-api",
        bin: { fern: "cli.cjs" },
    },
    tsupOverrides: PRODUCTION_TSUP_OVERRIDES
});
