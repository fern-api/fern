import { mkdir } from "fs/promises";

import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { AbstractGoGeneratorContext } from "../context/AbstractGoGeneratorContext";
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
        this.context.logger.debug(`Writing go files to ${this.absolutePathToOutputDirectory}`);
        await this.writeGoFiles({
            absolutePathToDirectory: this.absolutePathToOutputDirectory,
            files: this.sourceFiles
        });
        await this.writeRawFiles();
        this.context.logger.debug(`Successfully wrote go files to ${this.absolutePathToOutputDirectory}`);
    }

    public async writeRawFile(file: File): Promise<void> {
        await file.write(this.absolutePathToOutputDirectory);
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
            await loggingExeca(this.context.logger, "go", ["fmt", "./..."], {
                doNotPipeOutput: true,
                cwd: absolutePathToDirectory
            });
        }
        return absolutePathToDirectory;
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }
}
