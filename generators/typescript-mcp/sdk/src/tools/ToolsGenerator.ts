import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ToolsGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    SdkGeneratorContext
> {
    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine("// index.ts"); // TODO
            }),
            directory: RelativeFilePath.of(""),
            filename: "index.ts",
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of("tools"));
    }
}
