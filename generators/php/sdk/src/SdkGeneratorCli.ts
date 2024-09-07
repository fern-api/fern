import { AbstractPhpGeneratorCli } from "@fern-api/php-codegen";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class SdkGeneratorCLI extends AbstractPhpGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: SdkCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected async parseCustomConfigOrThrow(customConfig: unknown): Promise<SdkCustomConfigSchema> {
        return {};
    }

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        return undefined;
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        return undefined;
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        return undefined;
    }
}
