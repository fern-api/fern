import { AbstractGeneratorCli } from "@fern-api/csharp-generator-cli";
import { GeneratorContext } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { writeFile } from "fs/promises";
import { ModelCustomConfigSchema } from "./ModelCustomConfig";

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
        generatorContext.logger.info("Received IR", JSON.stringify(intermediateRepresentation, null, 2));
        await writeFile(`/${config.output.path}/ir.json`, JSON.stringify(intermediateRepresentation, null, 2));
    }

    protected async writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: ModelCustomConfigSchema,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        generatorContext.logger.info("Received IR", JSON.stringify(intermediateRepresentation, null, 2));
        await writeFile(`/${config.output.path}/ir.json`, JSON.stringify(intermediateRepresentation, null, 2));
    }

    protected shouldTolerateRepublish(customConfig: ModelCustomConfigSchema): boolean {
        return false;
    }
}
