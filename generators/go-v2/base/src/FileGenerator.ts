import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractGoGeneratorContext, BaseGoCustomConfigSchema } from "@fern-api/go-ast";

export abstract class FileGenerator<
    GeneratedFile extends File,
    CustomConfig extends BaseGoCustomConfigSchema,
    Context extends AbstractGoGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public generate(): GeneratedFile {
        this.context.logger.debug(`Generating ${this.getFilepath()}`);
        return this.doGenerate();
    }

    protected abstract doGenerate(): GeneratedFile;

    protected abstract getFilepath(): RelativeFilePath;
}
