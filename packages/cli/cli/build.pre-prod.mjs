import { buildCli, PRODUCTION_TSUP_OVERRIDES } from "./build-utils.mjs";

buildCli({
    outDir: "dist/pre-prod",
    minify: false,
    env: {
        AUTH0_DOMAIN: "fern-prod.us.auth0.com",
        AUTH0_CLIENT_ID: "syaWnk6SjNoo5xBf1omfvziU3q7085lh",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator.buildwithfern.com",
        DEFAULT_SDK_GEN_API_ORIGIN: "https://sdk-gen.postman.co",
        DEFAULT_USE_SDK_GEN_API: "true",
        DEFAULT_VENUS_ORIGIN: "https://sdk-gen-venus.postman.co",
        DEFAULT_FDR_ORIGIN: "https://sdk-gen-fern-definition-registry.postman.co",
        DEFAULT_FAI_ORIGIN: "https://sdk-gen-fern-fai.postman.co",
        DEFAULT_FDR_LAMBDA_DOCS_ORIGIN: "https://ykq45y6fvnszd35iv5yuuatkze0rpwuz.lambda-url.us-east-1.on.aws",
        VENUS_AUDIENCE: "venus-prod",
        FERN_DASHBOARD_URL_DEFAULT: "https://sdk-gen-fern-dashboard.postman.co",
        LOCAL_STORAGE_FOLDER: ".fern-pre-prod",
        POSTHOG_API_KEY: null,
        SENTRY_DSN: process.env.SENTRY_DSN ?? "",
        SENTRY_ENVIRONMENT: "pre-prod",
        DOCS_DOMAIN_SUFFIX: "docs.buildwithfern.com",
        DOCS_PREVIEW_BUCKET: "https://prod-local-preview-bundle2.s3.amazonaws.com/",
        APP_DOCS_TAR_PREVIEW_BUCKET: "https://prod-local-preview-bundle4.s3.amazonaws.com/",
        APP_DOCS_PREVIEW_BUCKET: "https://prod-local-preview-bundle3.s3.amazonaws.com/",
        CLI_NAME: "fern-pre-prod",
        CLI_PACKAGE_NAME: "@fern-api/fern-api-pre-prod",
        FERN_NO_VERSION_REDIRECTION: "true"
    },

    packageJsonOverrides: {
        name: "@fern-api/fern-api-pre-prod",
        bin: { "fern-pre-prod": "cli.cjs" }
    },
    tsupOverrides: PRODUCTION_TSUP_OVERRIDES
});
