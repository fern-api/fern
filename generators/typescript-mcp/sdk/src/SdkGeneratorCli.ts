import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractTypescriptMcpGeneratorCli } from "@fern-api/typescript-mcp-base";
import { generateModels, generateModelsIndex } from "@fern-api/typescript-mcp-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { TypescriptCustomConfigSchema } from "../../../typescript-v2/ast/src";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { ServerGenerator } from "./server/ServerGenerator";
import { ToolsGenerator } from "./tools/ToolsGenerator";

export class SdkGeneratorCLI extends AbstractTypescriptMcpGeneratorCli<
    TypescriptCustomConfigSchema,
    SdkGeneratorContext
> {
    protected constructContext({
        ir,
        customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation;
        customConfig: TypescriptCustomConfigSchema;
        generatorConfig: FernGeneratorExec.GeneratorConfig;
        generatorNotificationService: GeneratorNotificationService;
    }): SdkGeneratorContext {
        return new SdkGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): TypescriptCustomConfigSchema {
        const parsed = customConfig != null ? TypescriptCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return {};
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
        generateModels(context);
        generateModelsIndex(context);
        this.generateServer(context);
        this.generateTools(context);
        await context.project.persist();
    }

    private generateServer(context: SdkGeneratorContext) {
        const server = new ServerGenerator(context);
        context.project.addSrcFile(server.generate());
    }

    private generateTools(context: SdkGeneratorContext) {
        const tools = new ToolsGenerator(context);
        context.project.addToolsFile(tools.generate());
    }
}
