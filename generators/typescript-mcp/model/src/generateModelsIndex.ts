import { RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "@fern-api/typescript-ast";
import { TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext";

const SUBDIRECTORY_NAME = "";
const FILENAME = "index.ts";

export function generateModelsIndex(context: ModelGeneratorContext): void {
    const exportStrings = Object.values(context.ir.types).map((typeDeclaration) => {
        const schemaName = context.project.builder.getSchemaVariableName(
            typeDeclaration.name.name,
            typeDeclaration.name.fernFilepath
        );
        return `export { default as ${schemaName} } from "./${schemaName}";`;
    });
    const file = new TypescriptMcpFile({
        node: ts.codeblock((writer) => {
            exportStrings.forEach((exportString) => {
                writer.writeLine(exportString);
            });
        }),
        directory: RelativeFilePath.of(SUBDIRECTORY_NAME),
        filename: FILENAME,
        customConfig: context.customConfig
    });
    if (file != null) {
        context.project.addSchemasFile(file);
    }
}
