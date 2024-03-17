import { AbstractGeneratorCli } from "@fern-api/csharp-generator-cli";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "@fern-api/generator-commons";
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
        const directoryPrefix = join(AbsoluteFilePath.of(config.output.path), RelativeFilePath.of("src"));

        const files = new ModelGenerator("test", intermediateRepresentation, generatorContext).generateTypes();
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
        const directoryPrefix = join(AbsoluteFilePath.of(config.output.path), RelativeFilePath.of("src"));

        const files = new ModelGenerator("test", intermediateRepresentation, generatorContext).generateTypes();
        for (const file of files) {
            await file.write(directoryPrefix);
        }
    }

    protected shouldTolerateRepublish(customConfig: ModelCustomConfigSchema): boolean {
        return false;
    }
}
