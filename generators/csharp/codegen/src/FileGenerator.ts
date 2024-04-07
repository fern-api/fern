import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractCsharpGeneratorContext } from "./cli";
import { File } from "./project/File";

export abstract class FileGenerator<
    CustomConfig extends BaseCsharpCustomConfigSchema,
    Context extends AbstractCsharpGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public generate(): File {
        this.context.logger.debug(`Generating ${this.getFilepath()}`);
        return this.doGenerate();
    }

    protected abstract doGenerate(): File;

    protected abstract getFilepath(): RelativeFilePath;
}
