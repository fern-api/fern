import { AbstractProject, File } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { PythonFormatter } from "@fern-api/python-formatter";
import { readFile } from "fs/promises";
import path from "path";

import { AbstractPythonGeneratorContext } from "../cli/index.js";
import { BasePythonCustomConfigSchema } from "../custom-config/index.js";
import { WriteablePythonFile } from "./WriteablePythonFile.js";

const AS_IS_DIRECTORY = path.join(__dirname, "asIs");

/**
 * In memory representation of a Python project.
 */
export class PythonProject extends AbstractProject<AbstractPythonGeneratorContext<BasePythonCustomConfigSchema>> {
    private sourceFiles: WriteablePythonFile[] = [];
    private formatter: PythonFormatter;

    public constructor({ context }: { context: AbstractPythonGeneratorContext<BasePythonCustomConfigSchema> }) {
        super(context);
        this.formatter = new PythonFormatter();
    }

    public addSourceFiles(file: WriteablePythonFile): void {
        this.sourceFiles.push(file);
    }

    private async createRawFiles(): Promise<void> {
        for (const filename of this.context.getRawAsIsFiles()) {
            this.addRawFiles(await this.createRawAsIsFile({ filename }));
        }
        await this.writeRawFiles();
    }

    private async createRawAsIsFile({ filename }: { filename: string }): Promise<File> {
        let contents = (await readFile(getAsIsFilepath(filename))).toString();
        filename = filename.replace(".Template", "");
        if (filename.endsWith(".py")) {
            contents = await this.formatter.format(contents);
        }
        return new File(filename, RelativeFilePath.of(""), contents);
    }

    public async persist(): Promise<void> {
        this.context.logger.debug("Formatting and writing generated files...");
        await Promise.all(
            this.sourceFiles.map(async (file) => {
                if (typeof file.fileContents === "string") {
                    file.fileContents = await this.formatter.format(file.fileContents);
                }
                return await file.write(this.absolutePathToOutputDirectory);
            })
        );

        await this.createRawFiles();
    }
}

// TODO(nevil): Share code between this and CsharpProject.
function getAsIsFilepath(filename: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
}
