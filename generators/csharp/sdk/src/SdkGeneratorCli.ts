import { AbstractCsharpGeneratorCli, CsharpProject, TestFileGenerator } from "@fern-api/csharp-codegen";
import { ModelGenerator } from "@fern-api/fern-csharp-model";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { GeneratorNotificationService } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "./SdkCustomConfig";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { SubClientGenerator } from "./sub-client/SubClientGenerator";

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
        await this.generate(context);
    }

    protected async writeForDownload(context: SdkGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: SdkGeneratorContext): Promise<void> {
        const project = new CsharpProject(context, context.getNamespace());
        const files = new ModelGenerator(context).generateTypes();
        for (const file of files) {
            project.addSourceFiles(file);
        }
        for (const [_, subpackage] of Object.entries(context.ir.subpackages)) {
            if (subpackage.service == null) {
                continue;
            }
            const service = context.getServiceWithId(subpackage.service);
            const subClient = new SubClientGenerator(context, subpackage.service, service);
            project.addSourceFiles(subClient.generate());
        }

        const testGenerator = new TestFileGenerator(context);
        const test = testGenerator.generate();

        project.addTestFiles(test);

        await project.persist(AbsoluteFilePath.of(context.config.output.path));
    }
}
