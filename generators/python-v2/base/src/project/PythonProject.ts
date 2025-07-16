import { readFile } from 'fs/promises'
import path from 'path'

import { AbstractProject, File } from '@fern-api/base-generator'
import { AbsoluteFilePath, RelativeFilePath, join } from '@fern-api/fs-utils'
import { loggingExeca } from '@fern-api/logging-execa'

import { AbstractPythonGeneratorContext } from '../cli'
import { BasePythonCustomConfigSchema } from '../custom-config'
import { WriteablePythonFile } from './WriteablePythonFile'

const AS_IS_DIRECTORY = path.join(__dirname, 'asIs')

/**
 * In memory representation of a Python project.
 */
export class PythonProject extends AbstractProject<AbstractPythonGeneratorContext<BasePythonCustomConfigSchema>> {
    private sourceFiles: WriteablePythonFile[] = []

    public constructor({ context }: { context: AbstractPythonGeneratorContext<BasePythonCustomConfigSchema> }) {
        super(context)
    }

    public addSourceFiles(file: WriteablePythonFile): void {
        this.sourceFiles.push(file)
    }

    private async createRawFiles(): Promise<void> {
        for (const filename of this.context.getRawAsIsFiles()) {
            this.addRawFiles(await this.createRawAsIsFile({ filename }))
        }
        await this.writeRawFiles()
    }

    private async createRawAsIsFile({ filename }: { filename: string }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString()
        filename = filename.replace('.Template', '')
        return new File(filename, RelativeFilePath.of(''), contents)
    }

    public async persist(): Promise<void> {
        await Promise.all(
            this.sourceFiles.map(async (file) => {
                return await file.write(this.absolutePathToOutputDirectory)
            })
        )

        await this.createRawFiles()
        // await loggingExeca(undefined, "ruff", ["format", ".", "--no-cache"], {
        //     cwd: this.absolutePathToOutputDirectory
        // });
    }
}

// TODO(nevil): Share code between this and CsharpProject.
function getAsIsFilepath(filename: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename))
}
