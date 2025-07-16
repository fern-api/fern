import { GeneratorNotificationService } from "@fern-api/base-generator"
import { AbstractTypescriptMcpGeneratorCli } from "@fern-api/typescript-mcp-base"
import { generateModels } from "@fern-api/typescript-mcp-model"

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk"
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api"

import { TypescriptCustomConfigSchema } from "../../../typescript-v2/ast/src"
import { ServerGeneratorContext } from "./ServerGeneratorContext"
import { ReadmeGenerator } from "./readme/ReadmeGenerator"
import { ToolsGenerator } from "./tools/ToolsGenerator"

export declare namespace ServerGeneratorCLI {
    export interface Init {
        configOverrides?: Partial<TypescriptCustomConfigSchema>
    }
}

export class ServerGeneratorCLI extends AbstractTypescriptMcpGeneratorCli<
    TypescriptCustomConfigSchema,
    ServerGeneratorContext
> {
    private configOverrides: Partial<TypescriptCustomConfigSchema>

    constructor({ configOverrides }: ServerGeneratorCLI.Init) {
        super()
        this.configOverrides = configOverrides ?? {}
    }

    protected constructContext({
        ir,
        customConfig: _customConfig,
        generatorConfig,
        generatorNotificationService
    }: {
        ir: IntermediateRepresentation
        customConfig: TypescriptCustomConfigSchema
        generatorConfig: FernGeneratorExec.GeneratorConfig
        generatorNotificationService: GeneratorNotificationService
    }): ServerGeneratorContext {
        const customConfig = this.customConfigWithOverrides(_customConfig)
        return new ServerGeneratorContext(ir, generatorConfig, customConfig, generatorNotificationService)
    }

    protected parseCustomConfigOrThrow(customConfig: unknown): TypescriptCustomConfigSchema {
        const parsed = customConfig != null ? TypescriptCustomConfigSchema.parse(customConfig) : undefined
        if (parsed != null) {
            return parsed
        }
        return {}
    }

    protected async publishPackage(context: ServerGeneratorContext): Promise<void> {
        throw new Error("Method not implemented.")
    }

    protected async writeForGithub(context: ServerGeneratorContext): Promise<void> {
        await this.generate(context)
    }

    protected async writeForDownload(context: ServerGeneratorContext): Promise<void> {
        await this.generate(context)
    }

    protected async generate(context: ServerGeneratorContext): Promise<void> {
        generateModels(context)
        this.generateTools(context)
        this.generateReadme(context)
        await context.project.persist()
    }

    private generateTools(context: ServerGeneratorContext) {
        const tools = new ToolsGenerator(context)
        context.project.addToolsFile(tools.generate())
    }

    private generateReadme(context: ServerGeneratorContext) {
        const readme = new ReadmeGenerator(context)
        context.project.addSrcFile(readme.generate())
    }

    private customConfigWithOverrides(customConfig: TypescriptCustomConfigSchema): TypescriptCustomConfigSchema {
        return { ...customConfig, ...this.configOverrides }
    }
}
