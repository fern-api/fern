import { buildCli, MINIMAL_EXTERNALS } from "./build-utils.mjs";

buildCli({
    outDir: "dist/local",
    minify: false,
    env: {
        AUTH0_DOMAIN: "localhost:3100",
        AUTH0_CLIENT_ID: "fern",
        DEFAULT_FIDDLE_ORIGIN: "https://fiddle-coordinator-dev2.buildwithfern.com",
        DEFAULT_VENUS_ORIGIN: "http://localhost:8089",
        DEFAULT_FDR_ORIGIN: "http://localhost:8080",
        FERN_FDR_ORIGIN: "http://localhost:8080",
        DEFAULT_FDR_LAMBDA_ORIGIN: "http://localhost:8080",
        VENUS_AUDIENCE: "venus-dev",
        FERN_DASHBOARD_URL: "http://localhost:3000",
        LOCAL_STORAGE_FOLDER: ".fern-local",
        POSTHOG_API_KEY: null,
        SENTRY_DSN: null,
        SENTRY_ENVIRONMENT: "local",
        DOCS_DOMAIN_SUFFIX: "docs.buildwithfern.com",
        DOCS_PREVIEW_BUCKET: "http://localhost:9090/fdr/",
        APP_DOCS_TAR_PREVIEW_BUCKET: "http://localhost:9090/fdr/",
        APP_DOCS_PREVIEW_BUCKET: "http://localhost:9090/fdr/",
        CLI_NAME: "fern-local",
        CLI_PACKAGE_NAME: "fern-api"
    },
    runtimeDependencies: ["@boundaryml/baml"],
    packageJsonOverrides: {
        name: "fern-api",
        bin: { fern: "cli.cjs" }
    },
    tsupOverrides: {
        external: MINIMAL_EXTERNALS
    }
});
