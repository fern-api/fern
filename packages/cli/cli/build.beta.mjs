import { buildCli, PRODUCTION_TSUP_OVERRIDES } from "./build-utils.mjs";

buildCli({
    outDir: "dist/beta",
    minify: false,
    env: {
        AUTH0_DOMAIN: "fern-dev.us.auth0.com",
        AUTH0_CLIENT_ID: "4QiMvRvRUYpnycrVDK2M59hhJ6kcHYFQ",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev2.buildwithfern.com",
        DEFAULT_SDK_GEN_API_ORIGIN: "https://sdk-gen.postman-beta.tech",
        DEFAULT_USE_SDK_GEN_API: "false",
        DEFAULT_VENUS_ORIGIN: "https://sdk-gen-venus.postman-beta.tech",
        DEFAULT_FDR_ORIGIN: "https://sdk-gen-fern-definition-registry.postman-beta.tech",
        DEFAULT_FAI_ORIGIN: "https://sdk-gen-fern-fai.postman-beta.tech",
        DEFAULT_FDR_LAMBDA_DOCS_ORIGIN: "",
        VENUS_AUDIENCE: "venus-dev",
        FERN_DASHBOARD_URL_DEFAULT: "https://sdk-gen-fern-dashboard.postman-beta.tech",
        LOCAL_STORAGE_FOLDER: ".fern-beta",
        POSTHOG_API_KEY: null,
        SENTRY_DSN: process.env.SENTRY_DSN ?? "",
        SENTRY_ENVIRONMENT: "beta",
        DOCS_DOMAIN_SUFFIX: "docs.dev.buildwithfern.com", // intentional, we do not have a beta docs domain yet
        DOCS_PREVIEW_BUCKET: "https://dev2-local-preview-bundle2.s3.amazonaws.com/",
        APP_DOCS_TAR_PREVIEW_BUCKET: "https://dev2-local-preview-bundle4.s3.amazonaws.com/",
        APP_DOCS_PREVIEW_BUCKET: "https://dev2-local-preview-bundle3.s3.amazonaws.com/",
        CLI_NAME: "fern-beta",
        CLI_PACKAGE_NAME: "@fern-api/fern-api-beta"
    },

    packageJsonOverrides: {
        name: "@fern-api/fern-api-beta",
        bin: { "fern-beta": "cli.cjs" }
    },
    tsupOverrides: PRODUCTION_TSUP_OVERRIDES
});
