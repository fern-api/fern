import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

const SCHEMA_DIRECTORY = "src/schemas";

export class ObjectGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly typeDeclaration: TypeDeclaration;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
    }

    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine(`const ${this.typeDeclaration.name.name.pascalCase.safeName} = {};`);
                writer.writeLine(`export default ${this.typeDeclaration.name.name.pascalCase.safeName};`);
            }),
            directory: RelativeFilePath.of(SCHEMA_DIRECTORY),
            filename: `${this.typeDeclaration.name.name.pascalCase.safeName}.ts`,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of(SCHEMA_DIRECTORY);
    }
}
