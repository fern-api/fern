import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

import { AbstractTypescriptMcpGeneratorContext } from "./context/AbstractTypescriptMcpGeneratorContext";

export abstract class FileGenerator<
    GeneratedFile extends File,
    CustomConfig extends TypescriptCustomConfigSchema,
    Context extends AbstractTypescriptMcpGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public generate(): GeneratedFile {
        this.context.logger.debug(`Generating ${this.getFilepath()}`);
        return this.doGenerate();
    }

    protected abstract doGenerate(): GeneratedFile;

    protected abstract getDirectory(): RelativeFilePath;

    protected abstract getFilename(): string;

    protected abstract getFilepath(): RelativeFilePath;
}
