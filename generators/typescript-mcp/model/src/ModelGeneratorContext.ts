import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast"
import { AbstractTypescriptMcpGeneratorContext, AsIsFiles } from "@fern-api/typescript-mcp-base"

export class ModelGeneratorContext extends AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema> {
    public getRawAsIsFiles(): string[] {
        return [AsIsFiles.GitIgnore, AsIsFiles.TsConfigJson]
    }
}
