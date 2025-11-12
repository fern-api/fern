import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractCsharpGeneratorCli } from "@fern-api/csharp-base";
import { CsharpConfigSchema, Generation } from "@fern-api/csharp-codegen";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { generateModels } from "./generateModels";
import { generateVersion } from "./generateVersion";
import { generateWellKnownProtobufFiles } from "./generateWellKnownProtobufFiles";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

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
        const generatedTypes = generateModels({ context });
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

        await context.project.persist();
    }
}
