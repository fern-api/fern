import { AbstractCsharpGeneratorCli, packageUtils } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    FernGeneratorExec,
    GeneratorNotificationService,
    getPackageName as getPackageNameFromPublishConfig
} from "@fern-api/generator-commons";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { ModelGenerator } from "./ModelGenerator";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export class ModelGeneratorCLI extends AbstractCsharpGeneratorCli<ModelCustomConfigSchema, ModelGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: ModelCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): ModelGeneratorContext {
        return new ModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): ModelCustomConfigSchema {
        const parsed = customConfig != null ? ModelCustomConfigSchema.parse(customConfig) : undefined;
        return parsed ?? {};
    }

    protected async publishPackage(context: ModelGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        context.logger.info("Received IR, processing model generation for Github.");
        const packageName = packageUtils.getPackageName(
            context.config.organization,
            context.ir.apiName.pascalCase.safeName,
            "Client",
            getPackageNameFromPublishConfig(context.config)
        );
        const directoryPrefix = join(
            AbsoluteFilePath.of(context.config.output.path),
            RelativeFilePath.of("src"),
            RelativeFilePath.of(packageName)
        );

        const clientName = packageUtils.getClientName(
            context.config.organization,
            context.ir.apiName.pascalCase.safeName,
            "Client"
        );

        const files = new ModelGenerator(clientName, context.ir, context).generateTypes();
        for (const file of files) {
            await file.tryWrite(directoryPrefix);
        }
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        context.logger.info("Received IR, processing model generation for download.");
        const packageName = packageUtils.getPackageName(
            context.config.organization,
            context.ir.apiName.pascalCase.safeName,
            "Client",
            getPackageNameFromPublishConfig(context.config)
        );
        const directoryPrefix = join(
            AbsoluteFilePath.of(context.config.output.path),
            RelativeFilePath.of("src"),
            RelativeFilePath.of(packageName)
        );

        const clientName = packageUtils.getClientName(
            context.config.organization,
            context.ir.apiName.pascalCase.safeName,
            "Client"
        );

        const files = new ModelGenerator(clientName, context.ir, context).generateTypes();
        for (const file of files) {
            await file.tryWrite(directoryPrefix);
        }
    }
}
