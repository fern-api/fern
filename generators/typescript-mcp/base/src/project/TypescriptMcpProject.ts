import { mkdir, readFile } from "fs/promises";
import path from "path";

import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema } from "@fern-api/typescript-ast";

import { AbstractTypescriptMcpGeneratorContext } from "../context/AbstractTypescriptMcpGeneratorContext";

const AS_IS_DIRECTORY = path.join(__dirname, "asIs");

/**
 * In memory representation of a typescript project.
 */
export class TypescriptMcpProject extends AbstractProject<
    AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema>
> {
    private sourceFiles: File[] = [];

    public constructor({ context }: { context: AbstractTypescriptMcpGeneratorContext<TypescriptCustomConfigSchema> }) {
        super(context);
    }

    public addTypescriptMcpFiles(file: File): void {
        this.sourceFiles.push(file);
    }

    public async persist(): Promise<void> {
        this.context.logger.debug(`Writing typescript project files to ${this.absolutePathToOutputDirectory}`);
        // Write raw files first...
        for (const filename of this.context.getRawAsIsFiles()) {
            this.addRawFiles(await this.createRawAsIsFile({ filename }));
        }
        await this.writeRawFiles();
        // ... then write other source files
        await this.writeTypescriptMcpFiles({
            absolutePathToDirectory: this.absolutePathToOutputDirectory,
            files: this.sourceFiles
        });
        this.context.logger.debug(
            `Successfully wrote typescript project files to ${this.absolutePathToOutputDirectory}`
        );
    }

    private async createRawAsIsFile({ filename }: { filename: string }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        return new File(filename, RelativeFilePath.of(""), contents);
    }

    private async writeTypescriptMcpFiles({
        absolutePathToDirectory,
        files
    }: {
        absolutePathToDirectory: AbsoluteFilePath;
        files: File[];
    }): Promise<AbsoluteFilePath> {
        await this.mkdir(absolutePathToDirectory);
        await Promise.all(files.map(async (file) => await file.write(absolutePathToDirectory)));
        return absolutePathToDirectory;
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }
}

function getAsIsFilepath(filename: string): string {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
}
