import { buildCli, PRODUCTION_TSUP_OVERRIDES } from './build-utils.mjs';

buildCli({
    outDir: 'dist/dev',
    minify: false,
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
        CLI_PACKAGE_NAME: "@fern-api/fern-api-dev",
    },
    runtimeDependencies: ['@boundaryml/baml'],
    packageJsonOverrides: {
        name: "@fern-api/fern-api-dev",
        bin: { "fern-dev": "cli.cjs" },
    },
    tsupOverrides: PRODUCTION_TSUP_OVERRIDES
});
