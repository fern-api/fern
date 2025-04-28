import { GeneratorNotificationService } from "@fern-api/base-generator";
import { generateModels } from "@fern-api/php-model";
import { AbstractTypescriptMcpGeneratorCli } from "@fern-api/typescript-mcp-base";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { TypescriptCustomConfigSchema } from "../../../typescript-v2/ast/src";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { EntryStdioGenerator } from "./entry-stdio/EntryStdioGenerator";
import { ServerGenerator } from "./server/ServerGenerator";

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
        this.generateEntryStdio(context);
        this.generateServer(context);
        await context.project.persist();
    }

    private generateEntryStdio(context: SdkGeneratorContext) {
        const entryStdio = new EntryStdioGenerator(context);
        context.project.addTypescriptMcpFiles(entryStdio.generate());
    }

    private generateServer(context: SdkGeneratorContext) {
        const server = new ServerGenerator(context);
        context.project.addTypescriptMcpFiles(server.generate());
    }
}
