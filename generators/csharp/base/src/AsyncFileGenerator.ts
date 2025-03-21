import { File } from "@fern-api/base-generator";
import { BaseCsharpCustomConfigSchema } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { AbstractCsharpGeneratorContext } from "./context/AbstractCsharpGeneratorContext";

export abstract class AsyncFileGenerator<
    GeneratedFile extends File,
    CustomConfig extends BaseCsharpCustomConfigSchema,
    Context extends AbstractCsharpGeneratorContext<CustomConfig>
> {
    constructor(protected readonly context: Context) {}

    public async generate(): Promise<GeneratedFile> {
        if (await this.shouldGenerate()) {
            this.context.logger.debug(`Generating ${this.getFilepath()}`);
        } else {
            this.context.logger.warn(
                `Internal warning: Generating ${this.getFilepath()} even though the file generator should not have been called.`
            );
        }
        return await this.doGenerate();
    }

    public async shouldGenerate(): Promise<boolean> {
        return true;
    }

    protected abstract doGenerate(): Promise<GeneratedFile>;

    protected abstract getFilepath(): RelativeFilePath;
}
