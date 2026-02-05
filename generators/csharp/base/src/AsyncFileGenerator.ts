import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { GeneratorContext } from "./context/GeneratorContext";

export abstract class AsyncFileGenerator<GeneratedFile extends File> {
    constructor(protected readonly context: GeneratorContext) {}

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
