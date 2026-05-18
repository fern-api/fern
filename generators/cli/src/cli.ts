import {
    ExitStatusUpdate,
    GeneratorNotificationService,
    GeneratorUpdate,
    parseGeneratorConfig
} from "@fern-api/base-generator";
import { mkdir } from "fs/promises";
import { analyzeSpecs, formatSpecAnalysis } from "./analyzeSpecs.js";
import { copyRawSpecs } from "./copySpecs.js";

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

            const outputDir = config.output.path;
            await mkdir(outputDir, { recursive: true });

            // Analyze and print spec summary
            const analysis = await analyzeSpecs();
            if (analysis.totalSpecs > 0) {
                // biome-ignore lint/suspicious/noConsole: generator CLI output
                console.log(formatSpecAnalysis(analysis));
            } else {
                // biome-ignore lint/suspicious/noConsole: generator CLI output
                console.log("No API specs were mounted.");
            }

            // Copy raw API spec files from the mounted directory to the output
            await copyRawSpecs(outputDir);

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
