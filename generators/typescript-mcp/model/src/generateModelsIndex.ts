import { RelativeFilePath } from "@fern-api/fs-utils";
import { ts } from "@fern-api/typescript-ast";
import { TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext";

export function generateModelsIndex(context: ModelGeneratorContext): void {
    const file = new TypescriptMcpFile({
        node: ts.codeblock((writer) => {
            writer.writeLine("// index.ts"); // TODO
        }),
        directory: RelativeFilePath.of(""),
        filename: "index.ts",
        customConfig: context.customConfig
    });
    if (file != null) {
        context.project.addSchemasFiles(file);
    }
}
