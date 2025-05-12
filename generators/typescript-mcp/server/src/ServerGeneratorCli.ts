import { GeneratorNotificationService } from "@fern-api/base-generator";
import { AbstractTypescriptMcpGeneratorCli } from "@fern-api/typescript-mcp-base";
import { generateModels } from "@fern-api/typescript-mcp-model";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { TypescriptCustomConfigSchema } from "../../../typescript-v2/ast/src";
import { ServerGeneratorContext } from "./ServerGeneratorContext";
import { ReadmeGenerator } from "./readme/ReadmeGenerator";
import { ServerGenerator } from "./server/ServerGenerator";
import { ToolsGenerator } from "./tools/ToolsGenerator";

export class ServerGeneratorCLI extends AbstractTypescriptMcpGeneratorCli<
    TypescriptCustomConfigSchema,
    ServerGeneratorContext
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
    }): ServerGeneratorContext {
        return new ServerGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService);
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): TypescriptCustomConfigSchema {
        const parsed = customConfig != null ? TypescriptCustomConfigSchema.parse(customConfig) : undefined;
        if (parsed != null) {
            return parsed;
        }
        return {};
    }

    protected async publishPackage(context: ServerGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async writeForGithub(context: ServerGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async writeForDownload(context: ServerGeneratorContext): Promise<void> {
        await this.generate(context);
    }

    protected async generate(context: ServerGeneratorContext): Promise<void> {
        generateModels(context);
        this.generateServer(context);
        this.generateTools(context);
        this.generateReadme(context);
        await context.project.persist();
    }

    private generateServer(context: ServerGeneratorContext) {
        const server = new ServerGenerator(context);
        context.project.addSrcFile(server.generate());
    }

    private generateTools(context: ServerGeneratorContext) {
        const tools = new ToolsGenerator(context);
        context.project.addToolsFile(tools.generate());
    }

    private async generateReadme(context: ServerGeneratorContext) {
        const readme = new ReadmeGenerator(context);
        context.project.addSrcFile(readme.generate());
    }
}
