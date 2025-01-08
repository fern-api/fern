import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { AbstractCsharpGeneratorContext } from "./cli";
import { BaseCsharpCustomConfigSchema } from "./custom-config";

export abstract class FileGenerator<
    GeneratedFile extends File,
    CustomConfig extends BaseCsharpCustomConfigSchema,
    Context extends AbstractCsharpGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public generate(): GeneratedFile {
        this.context.logger.debug(`Generating ${this.getFilepath()}`);
        return this.doGenerate();
    }

    protected abstract doGenerate(): GeneratedFile;

    protected abstract getFilepath(): RelativeFilePath;
}
