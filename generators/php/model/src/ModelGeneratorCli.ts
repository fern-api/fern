import { GeneratorConfig, GeneratorNotificationService } from "@fern-api/generator-commons";
import { AbstractPhpGeneratorCli } from "@fern-api/php-codegen";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export class ModelGeneratorCLI extends AbstractPhpGeneratorCli<ModelCustomConfigSchema, ModelGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: ModelCustomConfigSchema;
        generatorConfig: GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): ModelGeneratorContext {
        return new ModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected async parseCustomConfigOrThrow(customConfig: unknown): Promise<void> {
        return undefined;
    }

    protected async publishPackage(context: ModelGeneratorContext): Promise<void> {
        return undefined;
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        return undefined;
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        return undefined;
    }
}
