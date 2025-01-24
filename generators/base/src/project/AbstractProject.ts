import { AbstractGeneratorContext } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { File } from "./File";

export abstract class AbstractProject<GeneratorContext extends AbstractGeneratorContext> {
    public readonly absolutePathToOutputDirectory: AbsoluteFilePath;
    public readonly rawFiles: File[] = [];

    public constructor(public readonly context: GeneratorContext) {
        this.absolutePathToOutputDirectory = AbsoluteFilePath.of(this.context.config.output.path);
    }

    public addRawFiles(file: File): void {
        this.rawFiles.push(file);
    }

    public async writeRawFiles(): Promise<void> {
        await Promise.all(this.rawFiles.map(async (file) => await file.write(this.absolutePathToOutputDirectory)));
    }

    /**
     * Persists the project by writing it to disk.
     */
    protected abstract persist(): Promise<void>;
}
