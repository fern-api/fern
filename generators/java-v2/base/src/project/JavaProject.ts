import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";
import { loggingExeca } from "@fern-api/logging-execa";
import { mkdir } from "fs/promises";
import { AbstractJavaGeneratorContext } from "../context/AbstractJavaGeneratorContext";

/**
 * In memory representation of a Java project.
 */
export class JavaProject extends AbstractProject<AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema>> {
    private sourceFiles: File[] = [];

    public constructor({ context }: { context: AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema> }) {
        super(context);
    }

    public addJavaFiles(file: File): void {
        const filepath = file.directory.length > 0 ? `${file.directory}/${file.filename}` : file.filename;
        this.context.logger.debug(`Generating ${filepath}`);
        this.sourceFiles.push(file);
    }

    public override addRawFiles(file: File): void {
        const filepath = file.directory.length > 0 ? `${file.directory}/${file.filename}` : file.filename;
        this.context.logger.debug(`Generating ${filepath}`);
        super.addRawFiles(file);
    }

    public async persist(): Promise<void> {
        this.context.logger.debug(`Writing java files to ${this.absolutePathToOutputDirectory}`);
        await this.writeJavaFiles({
            absolutePathToDirectory: this.absolutePathToOutputDirectory,
            files: this.sourceFiles
        });
        await this.writeRawFiles();
        this.context.logger.debug(`Successfully wrote java files to ${this.absolutePathToOutputDirectory}`);
        const gradlewPath = join(this.absolutePathToOutputDirectory, RelativeFilePath.of("gradlew"));
        const gradlewExists = await doesPathExist(gradlewPath, "file");
        if (gradlewExists) {
            this.context.logger.debug(`JavaProject: Running spotlessApply`);
            await loggingExeca(this.context.logger, "./gradlew", [":spotlessApply"], {
                doNotPipeOutput: false,
                cwd: this.absolutePathToOutputDirectory
            });
            this.context.logger.debug(`JavaProject: Successfully ran spotlessApply`);
        }
    }

    private async writeJavaFiles({
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
