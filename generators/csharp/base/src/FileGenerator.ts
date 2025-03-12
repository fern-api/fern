import { File } from "@fern-api/base-generator";
import { BaseCsharpCustomConfigSchema } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { AbstractCsharpGeneratorContext } from "./context/AbstractCsharpGeneratorContext";

export abstract class FileGenerator<
    GeneratedFile extends File,
    CustomConfig extends BaseCsharpCustomConfigSchema,
    Context extends AbstractCsharpGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public generate(): GeneratedFile {
        if (this.shouldGenerate()) {
            this.context.logger.debug(`Generating ${this.getFilepath()}`);
        } else {
            this.context.logger.warn(
                `Internal warning: Generating ${this.getFilepath()} even though the file generator should not have been called.`
            );
        }
        return this.doGenerate();
    }

    public shouldGenerate(): boolean {
        return true;
    }

    protected abstract doGenerate(): GeneratedFile;

    protected abstract getFilepath(): RelativeFilePath;
}
