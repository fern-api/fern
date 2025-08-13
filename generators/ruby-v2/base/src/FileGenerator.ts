import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";
import { AbstractRubyGeneratorContext } from "./context/AbstractRubyGeneratorContext";

export abstract class FileGenerator<
    GeneratedFile extends File,
    CustomConfig extends BaseRubyCustomConfigSchema,
    Context extends AbstractRubyGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public generate(): GeneratedFile {
        this.context.logger.debug(`Generating ${this.getFilepath()}`);
        return this.doGenerate();
    }

    protected abstract doGenerate(): GeneratedFile;

    protected abstract getFilepath(): RelativeFilePath;
}
