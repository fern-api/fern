import { File, GeneratorConfig, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractGoGeneratorCli } from "@fern-api/go-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { generateModels } from "./generateModels.js";
import { ModelCustomConfigSchema } from "./ModelCustomConfig.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";

export class ModelGeneratorCLI extends AbstractGoGeneratorCli<ModelCustomConfigSchema, ModelGeneratorContext> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: FernIr.IntermediateRepresentation;
        customConfig: ModelCustomConfigSchema;
        generatorConfig: GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): ModelGeneratorContext {
        return new ModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): ModelCustomConfigSchema {
        return {};
    }

    protected async publishPackage(context: ModelGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: ModelGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: ModelGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: ModelGeneratorContext): Promise<void> {
        this.generateDocs(context);
        generateModels(context);
        await context.project.persist({ tidy: true });
    }

    private generateDocs(context: ModelGeneratorContext): void {
        // TODO: This is a temporary, in-development solution for the fernapi/fern-go-model generator.
        // Once all of the model generator is built out, this can safely be removed. This has no impact
        // on any user-facing functionality.
        context.project.addRawFiles(
            new File("doc.go", RelativeFilePath.of("."), `package ${context.getRootPackageName()}`)
        );
    }
}
