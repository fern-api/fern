import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { AliasTypeDeclaration, PrimitiveTypeV1, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class AliasGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly typeDeclaration: TypeDeclaration;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly aliasDeclaration: AliasTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
    }

    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine('import z from "zod";');
                writer.writeLine("\n");
                writer.writeLine(
                    `export default ${this.aliasDeclaration.aliasOf._visit<string>({
                        container: () => "z.unknown",
                        named: () => "z.unknown",
                        primitive: (value) =>
                            `z.${PrimitiveTypeV1._visit(value.v1, {
                                integer: () => "number",
                                long: () => "number",
                                uint: () => "number",
                                uint64: () => "number",
                                float: () => "number",
                                double: () => "number",
                                boolean: () => "boolean",
                                string: () => "string",
                                date: () => "date",
                                dateTime: () => "date",
                                uuid: () => "string",
                                base64: () => "string",
                                bigInteger: () => "bigint",
                                _other: () => "any"
                            })}`,
                        unknown: () => "z.unknown",
                        _other: () => "z.any"
                    })}();`
                );
            }),
            directory: this.getFilepath(),
            filename: `${this.typeDeclaration.name.name.camelCase.safeName}.ts`,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("");
    }
}
