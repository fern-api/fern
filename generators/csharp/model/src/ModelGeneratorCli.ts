import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractCsharpGeneratorCli } from "@fern-api/csharp-base";
import { CsharpConfigSchema, Generation } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

import { generateModels } from "./generateModels.js";
import { generateVersion } from "./generateVersion.js";
import { generateWellKnownProtobufFiles } from "./generateWellKnownProtobufFiles.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";

export class ModelGeneratorCLI extends AbstractCsharpGeneratorCli {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: CsharpConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): ModelGeneratorContext {
        return new ModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): CsharpConfigSchema {
        const parsed = customConfig != null ? CsharpConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return this.validateCustomConfig(parsed);
        }
        return {};
    }

    private validateCustomConfig(customConfig: CsharpConfigSchema): CsharpConfigSchema {
        new Generation(
            {} as unknown as IntermediateRepresentation,
            "",
            customConfig,
            {} as FernGeneratorExec.GeneratorConfig
        ).csharp.validateReadOnlyMemoryTypes();

        return customConfig;
    }

    protected async publishPackage(context: ModelGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        return await this.generate(context);
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        return await this.generate(context);
    }

    private async generate(context: ModelGeneratorContext): Promise<void> {
        const generateStartTime = Date.now();
        const generatedTypes = generateModels({ context });
        context.logger.info(`[TIMING] generateModels took ${Date.now() - generateStartTime}ms`);
        for (const file of generatedTypes) {
            context.project.addSourceFiles(file);
        }

        context.project.addSourceFiles(generateVersion({ context }));

        const protobufFiles = generateWellKnownProtobufFiles(context);
        if (protobufFiles != null) {
            for (const file of protobufFiles) {
                context.project.addSourceFiles(file);
            }
        }

        context.logger.info(`[TIMING] code generation took ${Date.now() - generateStartTime}ms`);
        await context.project.persist();
    }
}
