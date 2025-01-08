/* eslint-disable no-console */
import { readFile } from "fs/promises";

import {
    AbstractGeneratorContext,
    FernGeneratorExec,
    GeneratorExecParsing,
    GeneratorNotificationService
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";

export abstract class AbstractGeneratorCli<
    CustomConfig,
    IntermediateRepresentation,
    GeneratorContext extends AbstractGeneratorContext
> {
    public async run(): Promise<void> {
        const config = await getGeneratorConfig();
        const generatorNotificationService = new GeneratorNotificationService(config.environment);
        try {
            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.initV2({
                    publishingToRegistry: "MAVEN"
                })
            );
            const ir = await this.parseIntermediateRepresentation(config.irFilepath);
            const customConfig = this.parseCustomConfigOrThrow(config.customConfig);
            const context = this.constructContext({
                ir,
                customConfig,
                generatorConfig: config,
                generatorNotificationService
            });
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
            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(FernGeneratorExec.ExitStatusUpdate.successful({}))
            );
        } catch (e) {
            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                    FernGeneratorExec.ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error"
                    })
                )
            );
            throw e;
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
        generatorNotificationService: GeneratorNotificationService;
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
}

async function getGeneratorConfig(): Promise<FernGeneratorExec.GeneratorConfig> {
    const pathToConfig = process.argv[process.argv.length - 1];
    if (pathToConfig == null) {
        throw new Error("No argument for config filepath was provided.");
    }
    const rawConfig = await readFile(pathToConfig);
    console.log(`Reading ${pathToConfig}`);
    const rawConfigString = rawConfig.toString();
    console.log(`Contents are ${rawConfigString}`);
    const validatedConfig = await GeneratorExecParsing.GeneratorConfig.parse(JSON.parse(rawConfigString), {
        unrecognizedObjectKeys: "passthrough"
    });
    if (!validatedConfig.ok) {
        throw new Error(`The generator config failed to pass validation. ${validatedConfig.errors.join(", ")}`);
    }
    return validatedConfig.value;
}
