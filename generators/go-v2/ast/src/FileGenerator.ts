import { RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractGoGeneratorContext } from "./context/AbstractGoGeneratorContext";
import { BaseGoCustomConfigSchema } from "./custom-config/BaseGoCustomConfigSchema";
import { File } from "@fern-api/base-generator";

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
