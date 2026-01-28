import { buildCli, PRODUCTION_TSUP_OVERRIDES } from "./build-utils.mjs";

buildCli({
    outDir: "dist/dev",
    minify: false,
    env: {
        CLI_NAME: "fern-v2"
    },
    packageJsonOverrides: {
        name: "@fern-api/fern-v2-dev",
        bin: { "fern-v2": "cli.cjs" }
    },
    runtimeDependencies: ["@boundaryml/baml"],
    tsupOverrides: PRODUCTION_TSUP_OVERRIDES
});
