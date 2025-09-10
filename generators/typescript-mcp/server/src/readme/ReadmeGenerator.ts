import { File } from "@fern-api/base-generator";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";
import { FileGenerator } from "@fern-api/typescript-mcp-base";

import { ServerGeneratorContext } from "../ServerGeneratorContext";

export class ReadmeGenerator extends FileGenerator<File, TypescriptCustomConfigSchema, ServerGeneratorContext> {
    public doGenerate(): File {
        return new File(this.getFilename(), this.getDirectory(), this.getFileContents());
    }

    protected getDirectory(): RelativeFilePath {
        return RelativeFilePath.of("../");
    }

    protected getFilename(): string {
        return "README.md";
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }

    private getFileContents(): string {
        return (
            `# ${this.context.project.builder.packageName}` +
            "\n\n" +
            this.getFernShield() +
            "\n\n" +
            this.context.project.builder.description
        );
    }

    private getFernShield(): string {
        const utmSource = encodeURIComponent(this.context.project.builder.packageName);
        return `[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=${utmSource})`;
    }
}
