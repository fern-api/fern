import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ServerGeneratorContext } from "../ServerGeneratorContext";

const SUBDIRECTORY_NAME = "../";
const FILENAME = "README.md";

export class ReadmeGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ServerGeneratorContext
> {
    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine(`# ${this.context.project.builder.packageName}`);
                writer.newLine();
                this.writeFernShield(writer);
                writer.newLine();
                writer.writeLine(this.context.project.builder.description);
            }),
            directory: this.getSubDirectory(),
            filename: FILENAME,
            customConfig: this.context.customConfig
        });
    }

    private getSubDirectory(): RelativeFilePath {
        return join(RelativeFilePath.of(SUBDIRECTORY_NAME));
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getSubDirectory(), RelativeFilePath.of(FILENAME));
    }

    private writeFernShield(writer: ts.Writer) {
        const utmSource = encodeURIComponent(this.context.project.builder.packageName);
        writer.writeLine(
            `[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=${utmSource})`
        );
    }
}
