import { GeneratorConfig, GeneratorNotificationService } from "@fern-api/base-generator";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { AbstractTypescriptMcpGeneratorCli } from "@fern-api/typescript-mcp-base";
import { FernIr } from "@fern-fern/ir-sdk";

import { generateModels } from "./generateModels.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";

export class ModelGeneratorCLI extends AbstractTypescriptMcpGeneratorCli<
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: FernIr.IntermediateRepresentation;
        customConfig: TypescriptCustomConfigSchema;
        generatorConfig: GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): ModelGeneratorContext {
        return new ModelGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): TypescriptCustomConfigSchema {
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
        generateModels(context);
        await context.project.persist();
    }
}
