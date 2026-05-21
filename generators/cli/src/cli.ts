import {
    ExitStatusUpdate,
    GeneratorNotificationService,
    GeneratorUpdate,
    parseGeneratorConfig,
    resolveErrorCode,
    SentryClient,
    shouldReportToSentry,
    shouldTrackLocalVariablesInSentry
} from "@fern-api/base-generator";
import { getCustomConfig } from "./customConfig.js";
import { runPipeline } from "./runPipeline.js";

const pathToConfig = process.argv[process.argv.length - 1];
if (pathToConfig == null) {
    throw new Error("No argument for config filepath.");
}

void generate(pathToConfig);

async function generate(configPath: string): Promise<void> {
    let sentryClient: SentryClient | undefined;
    try {
        const config = await parseGeneratorConfig(configPath);
        const generatorLoggingClient = new GeneratorNotificationService(config.environment);

        // Sentry init mirrors what AbstractGeneratorCli does. No-ops
        // when SENTRY_DSN isn't set or FERN_DISABLE_TELEMETRY=true,
        // so local runs stay quiet. shouldTrackLocalVariablesInSentry
        // decides whether to attach local-variable values to stack
        // frames — yes for remote container runs, no for local user
        // machines where values may contain secrets.
        sentryClient = new SentryClient({
            workspaceName: config.workspaceName,
            organization: config.organization,
            shouldTrackLocalVariables: shouldTrackLocalVariablesInSentry(config)
        });

        try {
            await generatorLoggingClient.sendUpdate(
                GeneratorUpdate.init({
                    packagesToPublish: []
                })
            );

            const outcome = await runPipeline({
                outputDir: config.output.path,
                customConfig: getCustomConfig(config)
            });

            if (outcome.status === "skipped") {
                // biome-ignore lint/suspicious/noConsole: generator CLI output
                console.log("No OpenAPI specs mounted — skipping CLI generation.");
            }

            await generatorLoggingClient.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful({})));
        } catch (e) {
            // biome-ignore lint/suspicious/noConsole: generator CLI output
            console.error("Generation failed:", e instanceof Error ? e.message : e);
            if (shouldReportToSentry(e)) {
                await sentryClient?.captureException(e, { errorCode: resolveErrorCode(e) });
            }
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
        if (shouldReportToSentry(e)) {
            await sentryClient?.captureException(e, { errorCode: resolveErrorCode(e) });
        }
        throw e;
    } finally {
        // Flush queued Sentry events before the process exits.
        await sentryClient?.flush();
    }
}
