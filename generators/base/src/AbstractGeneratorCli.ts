import {
    AbstractGeneratorContext,
    AbstractGeneratorNotificationService,
    FernGeneratorExec,
    GeneratorExecParsing,
    GeneratorNotificationService,
    NopGeneratorNotificationService
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import { GeneratorError, resolveErrorCode, shouldReportToSentry } from "./GeneratorError.js";
import { SentryClient } from "./telemetry/SentryClient.js";
import { shouldTrackLocalVariablesInSentry } from "./telemetry/shouldTrackLocalVariablesInSentry.js";

export declare namespace AbstractGeneratorCli {
    interface Options {
        /* Whether to disable notifications */
        disableNotifications?: boolean;
    }
}

export abstract class AbstractGeneratorCli<
    CustomConfig,
    IntermediateRepresentation,
    GeneratorContext extends AbstractGeneratorContext
> {
    protected readonly GENERATION_METADATA_FILEPATH = RelativeFilePath.of("./.fern");
    protected readonly GENERATION_METADATA_FILENAME = "metadata.json";

    public async run(options: AbstractGeneratorCli.Options = {}): Promise<void> {
        const config = await getGeneratorConfig();
        let sentryClient: SentryClient | undefined;
        let generatorNotificationService: AbstractGeneratorNotificationService = options.disableNotifications
            ? new NopGeneratorNotificationService()
            : new GeneratorNotificationService(config.environment);
        try {
            sentryClient = new SentryClient({
                workspaceName: config.workspaceName,
                organization: config.organization,
                shouldTrackLocalVariables: shouldTrackLocalVariablesInSentry(config)
            });
            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.initV2({
                    publishingToRegistry: "MAVEN"
                })
            );
            const irStartTime = Date.now();
            const ir = await this.parseIntermediateRepresentation(config.irFilepath);
            const irElapsed = Date.now() - irStartTime;
            const customConfig = this.parseCustomConfigOrThrow(config.customConfig);
            const contextStartTime = Date.now();
            const context = this.constructContext({
                ir,
                customConfig,
                generatorConfig: config,
                generatorNotificationService
            });
            context.logger.debug(`[TIMING] parseIntermediateRepresentation took ${irElapsed}ms`);
            context.logger.debug(`[TIMING] constructContext took ${Date.now() - contextStartTime}ms`);
            const metadataStartTime = Date.now();
            await this.generateMetadata(context);
            context.logger.debug(`[TIMING] generateMetadata took ${Date.now() - metadataStartTime}ms`);
            const outputStartTime = Date.now();
            switch (config.output.mode.type) {
                case "publish":
                    await this.publishPackage(context);
                    break;
                case "github":
                    await this.writeForGithub(context);
                    break;
                case "downloadFiles":
                    await this.writeForDownload(context);
                    break;
                default:
                    assertNever(config.output.mode);
            }
            context.logger.debug(`[TIMING] output (${config.output.mode.type}) took ${Date.now() - outputStartTime}ms`);
            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(FernGeneratorExec.ExitStatusUpdate.successful({}))
            );
        } catch (e) {
            const errorCode = resolveErrorCode(e);
            if (shouldReportToSentry(e)) {
                await sentryClient?.captureException(e);
            }
            if (generatorNotificationService != null) {
                const exitMessage = e instanceof Error ? e.message : "Encountered error";
                await generatorNotificationService.sendUpdate(
                    FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                        FernGeneratorExec.ExitStatusUpdate.error({
                            message: exitMessage
                        })
                    )
                );
            }
            throw e;
        } finally {
            await sentryClient?.flush();
        }
    }

    /**
     * Parses the custom config from the generator config.
     * @param customConfig
     */
    protected abstract parseCustomConfigOrThrow(customConfig: unknown): CustomConfig;

    /**
     * Loads the intermediate representation from the specified file.
     * @param irFilepath
     */
    protected abstract parseIntermediateRepresentation(irFilepath: string): Promise<IntermediateRepresentation>;

    /**
     * Constructs the generator context.
     * @param config
     * @param packageName
     */
    protected abstract constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: CustomConfig;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: AbstractGeneratorNotificationService;
    }): GeneratorContext;

    /**
     * Outputs generated files and publishes the package to the specified package registry.
     * @param context
     */
    protected abstract publishPackage(context: GeneratorContext): Promise<void>;

    /**
     * Outputs generated files to be synced to a GitHub repository.
     * @param context
     */
    protected abstract writeForGithub(context: GeneratorContext): Promise<void>;

    /**
     *Outputs generated files to be downloaded to the user's machine.
     * @param context
     */
    protected abstract writeForDownload(context: GeneratorContext): Promise<void>;

    /**
     * Adds the /.fern/metadata.json file to the project
     * Included in this layer to ensure it's generated for all generation types
     * @param context
     */
    protected abstract generateMetadata(context: GeneratorContext): Promise<void>;
}

async function getGeneratorConfig(): Promise<FernGeneratorExec.GeneratorConfig> {
    const pathToConfig = process.argv[process.argv.length - 1];
    if (pathToConfig == null) {
        throw GeneratorError.environmentError("No argument for config filepath was provided.");
    }
    const rawConfig = await readFile(pathToConfig);
    console.log(`Reading ${pathToConfig}`);
    const rawConfigString = rawConfig.toString();
    console.log(`Contents are ${rawConfigString}`);
    const validatedConfig = await GeneratorExecParsing.GeneratorConfig.parse(JSON.parse(rawConfigString), {
        unrecognizedObjectKeys: "passthrough"
    });
    if (!validatedConfig.ok) {
        throw GeneratorError.validationError(
            `The generator config failed to pass validation. ${validatedConfig.errors.map((e) => (typeof e === "object" ? JSON.stringify(e) : String(e))).join(", ")}`
        );
    }
    return validatedConfig.value;
}
