import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";

import { AbstractRustGeneratorContext } from "./context/AbstractRustGeneratorContext";

export abstract class FileGenerator<
    GeneratedFile extends File,
    CustomConfig extends BaseRustCustomConfigSchema,
    Context extends AbstractRustGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public generate(): GeneratedFile {
        this.context.logger.debug(`Generating ${this.getFilepath()}`);
        return this.doGenerate();
    }

    protected abstract doGenerate(): GeneratedFile;

    protected abstract getFilepath(): RelativeFilePath;
}
