import { AbstractCsharpGeneratorCli, CsharpProject } from "@fern-api/csharp-codegen";
import { ModelGenerator } from "@fern-api/fern-csharp-model";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";

export class SdkGeneratorCLI extends AbstractCsharpGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
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

    protected parseCustomConfigOrThrow(customConfig: unknown): SdkCustomConfigSchema {
        const parsed = customConfig != null ? SdkCustomConfigSchema.parse(customConfig) : undefined;
        return parsed ?? {};
    }

    protected async publishPackage(context: SdkGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: SdkGeneratorContext): Promise<void> {
        const project = new CsharpProject(context, context.getNamespace());
        const files = new ModelGenerator(context).generateTypes();
        for (const file of files) {
            project.addSourceFiles(file);
        }
        await project.persist(AbsoluteFilePath.of(context.config.output.path));
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        const project = new CsharpProject(context, context.getNamespace());
        const files = new ModelGenerator(context).generateTypes();
        for (const file of files) {
            project.addSourceFiles(file);
        }
        await project.persist(AbsoluteFilePath.of(context.config.output.path));
    }
}
