import { File, GeneratorNotificationService } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractTypescriptMcpGeneratorCli } from "@fern-api/typescript-mcp-base";
import { generateModels, generateModelsIndex } from "@fern-api/typescript-mcp-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Endpoint } from "@fern-fern/generator-exec-sdk/api";
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
        await this.generateReadme({
            context,
            endpointSnippets: []
        });
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

    private async generateReadme({
        context,
        endpointSnippets
    }: {
        context: SdkGeneratorContext;
        endpointSnippets: Endpoint[];
    }): Promise<void> {
        // if (endpointSnippets.length === 0) {
        //     context.logger.debug("No snippets were produced; skipping README.md generation.");
        //     return;
        // }

        const content = await context.generatorAgent.generateReadme({ context, endpointSnippets });
        context.project.addRawFiles(
            new File(context.generatorAgent.README_FILENAME, RelativeFilePath.of("."), content)
        );
    }
}
