import { mkdir } from "fs/promises";

import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractGoGeneratorContext, BaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { loggingExeca } from "@fern-api/logging-execa";

/**
 * In memory representation of a Go project.
 */
export class GoProject extends AbstractProject<AbstractGoGeneratorContext<BaseGoCustomConfigSchema>> {
    private sourceFiles: File[] = [];

    public constructor({ context }: { context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema> }) {
        super(context);
    }

    public addGoFiles(file: File): void {
        this.sourceFiles.push(file);
    }

    public async persist(): Promise<void> {
        await this.writeGoFiles({
            absolutePathToDirectory: this.absolutePathToOutputDirectory,
            files: this.sourceFiles
        });

        await this.writeRawFiles();
    }

    private async writeGoFiles({
        absolutePathToDirectory,
        files
    }: {
        absolutePathToDirectory: AbsoluteFilePath;
        files: File[];
    }): Promise<AbsoluteFilePath> {
        await this.mkdir(absolutePathToDirectory);
        await Promise.all(files.map(async (file) => await file.write(absolutePathToDirectory)));
        if (files.length > 0) {
            // TODO: Uncomment this once the go-v2 generator is responsible for producing the go.mod file.
            // Otherwise, we get a "directory prefix . does not contain main module or its selected dependencies" error.
            //
            // ---
            //
            // await loggingExeca(this.context.logger, "go", ["fmt", "./..."], {
            //     doNotPipeOutput: true,
            //     cwd: absolutePathToDirectory
            // });
        }
        return absolutePathToDirectory;
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }
}
