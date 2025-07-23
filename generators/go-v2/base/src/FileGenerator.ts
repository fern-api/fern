import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { AbstractGoGeneratorContext } from "./context/AbstractGoGeneratorContext";
import { GoFile } from "./project";

export abstract class FileGenerator<
    GeneratedFile extends File | GoFile,
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
