import { packageUtils } from "@fern-api/csharp-codegen";
import { AbstractGeneratorCli } from "@fern-api/csharp-generator-cli";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext, getPackageName as getPackageNameFromPublishConfig } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";
import { ModelGenerator } from "./ModelGenerator";

export class ModelGeneratorCLI extends AbstractGeneratorCli<ModelCustomConfigSchema> {
    protected parseCustomConfig(customConfig: unknown): ModelCustomConfigSchema {
        const parsed = customConfig != null ? ModelCustomConfigSchema.parse(customConfig) : undefined;
        return parsed ?? {};
    }

    protected async publishPackage(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: ModelCustomConfigSchema,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: ModelCustomConfigSchema,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        githubOutputMode: FernGeneratorExec.GithubOutputMode
    ): Promise<void> {
        generatorContext.logger.info("Received IR, processing model generation for Github.");
        const packageName = packageUtils.getPackageName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName,
            getPackageNameFromPublishConfig(config)
        );
        const directoryPrefix = join(
            AbsoluteFilePath.of(config.output.path),
            RelativeFilePath.of("src"),
            RelativeFilePath.of(packageName)
        );

        const clientName = packageUtils.getClientName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName
        );

        const files = new ModelGenerator(clientName, intermediateRepresentation, generatorContext).generateTypes();
        for (const file of files) {
            await file.write(directoryPrefix);
        }
    }

    protected async writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: ModelCustomConfigSchema,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        generatorContext.logger.info("Received IR, processing model generation for download.");
        const packageName = packageUtils.getPackageName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName,
            getPackageNameFromPublishConfig(config)
        );
        const directoryPrefix = join(
            AbsoluteFilePath.of(config.output.path),
            RelativeFilePath.of("src"),
            RelativeFilePath.of(packageName)
        );

        const clientName = packageUtils.getClientName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName
        );

        const files = new ModelGenerator(clientName, intermediateRepresentation, generatorContext).generateTypes();
        for (const file of files) {
            await file.write(directoryPrefix);
        }
    }

    protected shouldTolerateRepublish(customConfig: ModelCustomConfigSchema): boolean {
        return false;
    }
}
