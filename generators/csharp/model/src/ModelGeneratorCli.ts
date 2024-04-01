import { AbstractCsharpGeneratorCli, CsharpProject } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernGeneratorExec, GeneratorNotificationService } from "@fern-api/generator-commons";
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
        const project = new CsharpProject(context, context.getNamespace());
        const files = new ModelGenerator(context).generateTypes();
        for (const file of files) {
            project.addSourceFiles(file);
        }
        await project.persist(AbsoluteFilePath.of(context.config.output.path));
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        const project = new CsharpProject(context, context.getNamespace());
        const files = new ModelGenerator(context).generateTypes();
        for (const file of files) {
            project.addSourceFiles(file);
        }
        await project.persist(AbsoluteFilePath.of(context.config.output.path));
    }
}
