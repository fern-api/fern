import { mkdir } from 'fs/promises'

import { AbstractProject, File } from '@fern-api/base-generator'
import { AbsoluteFilePath } from '@fern-api/fs-utils'
import { BaseJavaCustomConfigSchema } from '@fern-api/java-ast'

import { AbstractJavaGeneratorContext } from '../context/AbstractJavaGeneratorContext'

/**
 * In memory representation of a Java project.
 */
export class JavaProject extends AbstractProject<AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema>> {
    private sourceFiles: File[] = []

    public constructor({ context }: { context: AbstractJavaGeneratorContext<BaseJavaCustomConfigSchema> }) {
        super(context)
    }

    public addJavaFiles(file: File): void {
        this.sourceFiles.push(file)
    }

    public async persist(): Promise<void> {
        this.context.logger.debug(`Writing java files to ${this.absolutePathToOutputDirectory}`)
        await this.writeJavaFiles({
            absolutePathToDirectory: this.absolutePathToOutputDirectory,
            files: this.sourceFiles
        })
        await this.writeRawFiles()
        this.context.logger.debug(`Successfully wrote java files to ${this.absolutePathToOutputDirectory}`)
    }

    private async writeJavaFiles({
        absolutePathToDirectory,
        files
    }: {
        absolutePathToDirectory: AbsoluteFilePath
        files: File[]
    }): Promise<AbsoluteFilePath> {
        await this.mkdir(absolutePathToDirectory)
        await Promise.all(files.map(async (file) => await file.write(absolutePathToDirectory)))
        return absolutePathToDirectory
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`)
        await mkdir(absolutePathToDirectory, { recursive: true })
    }
}
