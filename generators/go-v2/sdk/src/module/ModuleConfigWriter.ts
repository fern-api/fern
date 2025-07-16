import dedent from 'dedent'

import { File } from '@fern-api/base-generator'
import { RelativeFilePath } from '@fern-api/fs-utils'
import { FileGenerator } from '@fern-api/go-base'

import { SdkCustomConfigSchema } from '../SdkCustomConfig'
import { SdkGeneratorContext } from '../SdkGeneratorContext'
import { ModuleConfig } from './ModuleConfig'

export class ModuleConfigWriter extends FileGenerator<File, SdkCustomConfigSchema, SdkGeneratorContext> {
    private moduleConfig: ModuleConfig

    public constructor({ context, moduleConfig }: { context: SdkGeneratorContext; moduleConfig: ModuleConfig }) {
        super(context)
        this.moduleConfig = moduleConfig
    }

    public doGenerate(): File {
        return new File(this.getFilepath(), this.getDirectory(), this.getContent())
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of(ModuleConfig.FILENAME)
    }

    private getDirectory(): RelativeFilePath {
        return RelativeFilePath.of('.')
    }

    private getContent(): string {
        return dedent`
            ${this.writeModulePath()}
            ${this.writeGoVersion()}
            ${this.writeImports()}
        `
    }

    private writeModulePath(): string {
        return `module ${this.moduleConfig.path}`
    }

    private writeGoVersion(): string {
        return `go ${this.moduleConfig.version ?? ModuleConfig.DEFAULT.version}`
    }

    private writeImports(): string {
        if (this.moduleConfig.imports == null) {
            return ''
        }
        return Object.entries(this.moduleConfig.imports)
            .map(([importPath, version]) => this.writeImport({ importPath, version }))
            .join('\n')
    }

    private writeImport({ importPath, version }: { importPath: string; version: string }): string {
        return `require ${importPath} ${version}`
    }
}
