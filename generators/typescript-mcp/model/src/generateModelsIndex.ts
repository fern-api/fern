import { RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "@fern-api/typescript-ast";
import { TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext";

export function generateModelsIndex(context: ModelGeneratorContext): void {
    const exportStrings = Object.values(context.ir.types).map((typeDeclaration) => {
        return `export { default as ${typeDeclaration.name.name.camelCase.safeName} } from "./${typeDeclaration.name.name.camelCase.safeName}";`;
    });
    const file = new TypescriptMcpFile({
        node: ts.codeblock((writer) => {
            exportStrings.forEach((exportString) => {
                writer.writeLine(exportString);
            });
        }),
        directory: RelativeFilePath.of(""),
        filename: "index.ts",
        customConfig: context.customConfig
    });
    if (file != null) {
        context.project.addSchemasFile(file);
    }
}
