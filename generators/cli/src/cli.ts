import {
    ExitStatusUpdate,
    GeneratorNotificationService,
    GeneratorUpdate,
    parseGeneratorConfig
} from "@fern-api/base-generator";
import { mkdir } from "fs/promises";
import { copySdk } from "./copySdk.js";
import { copySpecs, hasOpenApiSpecs } from "./copySpecs.js";

const pathToConfig = process.argv[process.argv.length - 1];
if (pathToConfig == null) {
    throw new Error("No argument for config filepath.");
}

void generate(pathToConfig);

async function generate(configPath: string): Promise<void> {
    try {
        const config = await parseGeneratorConfig(configPath);
        const generatorLoggingClient = new GeneratorNotificationService(config.environment);

        try {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            // Fern-definition workspaces (and any other input without
            // mounted OpenAPI specs) can't drive the bundled CLI binary,
            // so exit cleanly without touching the output dir. Generating
            // a half-wired SDK template would just leave the user with a
            // Cargo workspace that can't compile.
            if (!(await hasOpenApiSpecs())) {
                // biome-ignore lint/suspicious/noConsole: generator CLI output
                console.log("No OpenAPI specs mounted — skipping CLI generation.");
                await generatorLoggingClient.sendUpdate(
                    GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({}))
                );
                return;
            }

            const outputDir = config.output.path;
            await mkdir(outputDir, { recursive: true });

            // Copy the bundled Rust SDK template into the user's output dir.
            // The template lives at /dist/sdk inside the Docker image
            // (build.mjs copies ./sdk there at generator-build time).
            await copySdk(outputDir);

            // Write each mounted OpenAPI spec into `cli/openapi-fixture/`
            // and emit a fresh main.rs that embeds them via include_str!.
            await copySpecs(outputDir);

            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
        } catch (e) {
            // biome-ignore lint/suspicious/noConsole: generator CLI output
            console.error("Generation failed:", e instanceof Error ? e.message : e);
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.exitStatusUpdate(
                    ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error"
                    })
                )
            );
        }
    } catch (e) {
        // biome-ignore lint/suspicious/noConsole: generator CLI output
        console.error("Encountered error", e);
        throw e;
    }
}
