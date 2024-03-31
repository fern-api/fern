import { AbstractGeneratorCli } from "@fern-api/csharp-generator-commons";
import { GeneratorContext } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { writeFile } from "fs/promises";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";

export class SdkGeneratorCLI extends AbstractCsharp<SdkCustomConfigSchema> {
    protected parseCustomConfig(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        return parsed ?? {};
    }

    protected async publishPackage(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: SdkCustomConfigSchema,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: SdkCustomConfigSchema,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        githubOutputMode: FernGeneratorExec.GithubOutputMode
    ): Promise<void> {
        generatorContext.logger.info("Received IR", JSON.stringify(intermediateRepresentation, null, 2));
        await writeFile(`/${config.output.path}/ir.json`, JSON.stringify(intermediateRepresentation, null, 2));
    }

    protected async writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: SdkCustomConfigSchema,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        generatorContext.logger.info("Received IR", JSON.stringify(intermediateRepresentation, null, 2));
        await writeFile(`/${config.output.path}/ir.json`, JSON.stringify(intermediateRepresentation, null, 2));
    }
}
