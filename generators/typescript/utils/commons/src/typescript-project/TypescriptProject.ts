import { mkdir, writeFile } from 'fs/promises'
import Dirent from 'memfs/lib/Dirent'
import { Volume } from 'memfs/lib/volume'
import path from 'path'
import tmp from 'tmp-promise'
import { Project } from 'ts-morph'

import { AbsoluteFilePath, RelativeFilePath } from '@fern-api/fs-utils'
import { NpmPackage } from '@fern-api/typescript-base'

import { PackageDependencies } from '../dependency-manager/DependencyManager'
import { PersistedTypescriptProject } from './PersistedTypescriptProject'

export declare namespace TypescriptProject {
    export interface Init {
        runScripts: boolean
        tsMorphProject: Project
        extraFiles: Record<string, string>
        extraDependencies: Record<string, string>
        extraPeerDependencies: Record<string, string>
        extraPeerDependenciesMeta: Record<string, unknown>
        extraDevDependencies: Record<string, string>
        extraScripts: Record<string, string>
        npmPackage: NpmPackage | undefined
        dependencies: PackageDependencies
        extraConfigs: Record<string, unknown> | undefined
        outputJsr: boolean
        exportSerde: boolean
        packagePath?: string
    }
}

export abstract class TypescriptProject {
    protected static readonly DEFAULT_SRC_DIRECTORY = 'src'
    protected static readonly TEST_DIRECTORY = 'tests'
    protected static readonly DIST_DIRECTORY = 'dist'
    protected static readonly SCRIPTS_DIRECTORY_NAME = 'scripts'

    protected static readonly CJS_DIRECTORY = 'cjs'
    protected static readonly ESM_DIRECTORY = 'esm'
    protected static readonly TYPES_DIRECTORY = 'types'

    protected static readonly BUILD_SCRIPT_FILENAME = 'build.js'
    protected static readonly NODE_DIST_DIRECTORY = 'node'
    protected static readonly BROWSER_DIST_DIRECTORY = 'browser'
    protected static readonly BROWSER_ESM_DIST_DIRECTORY =
        `${TypescriptProject.BROWSER_DIST_DIRECTORY}/${TypescriptProject.ESM_DIRECTORY}` as const
    protected static readonly BROWSER_CJS_DIST_DIRECTORY =
        `${TypescriptProject.BROWSER_DIST_DIRECTORY}/${TypescriptProject.CJS_DIRECTORY}` as const
    protected static readonly API_BUNDLE_FILENAME = 'index.js'

    protected static readonly PRETTIER_RC_FILENAME = '.prettierrc.yml'
    protected static readonly TS_CONFIG_BASE_FILENAME = 'tsconfig.base.json'
    protected static readonly TS_CONFIG_FILENAME = 'tsconfig.json'
    protected static readonly TS_CONFIG_ESM_FILENAME = 'tsconfig.esm.json'
    protected static readonly TS_CONFIG_CJS_FILENAME = 'tsconfig.cjs.json'
    protected static readonly PACKAGE_JSON_FILENAME = 'package.json'
    protected static readonly JSR_JSON_FILENAME = 'jsr.json'
    protected static readonly GIT_IGNORE_FILENAME = '.gitignore'
    protected static readonly NPM_IGNORE_FILENAME = '.npmignore'
    protected static readonly FERN_IGNORE_FILENAME = '.fernignore'
    protected static readonly REFERENCE_FILENAME = 'reference.md'
    protected static readonly README_FILENAME = 'README.md'
    protected static readonly LICENSE_FILENAME = 'LICENSE'

    protected static readonly FORMAT_SCRIPT_NAME = 'format'
    protected static readonly COMPILE_SCRIPT_NAME = 'compile'
    protected static readonly BUNDLE_SCRIPT_NAME = 'bundle'
    protected static readonly BUILD_SCRIPT_NAME = 'build'
    protected static readonly BUILD_CJS_SCRIPT_NAME = 'build:cjs'
    protected static readonly BUILD_ESM_SCRIPT_NAME = 'build:esm'

    private readonly exportSerde: boolean
    protected readonly npmPackage: NpmPackage | undefined
    protected readonly dependencies: PackageDependencies
    protected readonly extraConfigs: Record<string, unknown> | undefined
    protected readonly outputJsr: boolean
    protected readonly volume = new Volume()
    public readonly tsMorphProject: Project
    public readonly extraFiles: Record<string, string>
    protected readonly extraDependencies: Record<string, string>
    protected readonly extraDevDependencies: Record<string, string>
    protected readonly extraPeerDependenciesMeta: Record<string, unknown>
    protected readonly extraPeerDependencies: Record<string, string>
    protected readonly extraScripts: Record<string, string>
    protected readonly packagePath: string

    private readonly runScripts: boolean

    constructor({
        npmPackage,
        runScripts,
        tsMorphProject,
        extraDependencies,
        extraDevDependencies,
        extraFiles,
        extraScripts,
        extraPeerDependencies,
        extraPeerDependenciesMeta,
        dependencies,
        outputJsr,
        exportSerde,
        extraConfigs,
        packagePath
    }: TypescriptProject.Init) {
        this.npmPackage = npmPackage
        this.runScripts = runScripts
        this.tsMorphProject = tsMorphProject
        this.extraDependencies = extraDependencies
        this.extraDevDependencies = extraDevDependencies
        this.extraFiles = extraFiles
        this.extraScripts = extraScripts
        this.extraPeerDependenciesMeta = extraPeerDependenciesMeta
        this.extraPeerDependencies = extraPeerDependencies
        this.dependencies = dependencies
        this.outputJsr = outputJsr ?? false
        this.exportSerde = exportSerde
        this.extraConfigs = extraConfigs
        this.packagePath = packagePath ?? TypescriptProject.DEFAULT_SRC_DIRECTORY
    }

    public getFoldersForExports(): string[] {
        const exports = []
        if (this.exportSerde) {
            exports.push('serialization')
        }
        return exports
    }

    public async persist(): Promise<PersistedTypescriptProject> {
        // write to disk
        const directoryOnDiskToWriteTo = AbsoluteFilePath.of((await tmp.dir()).path)
        // biome-ignore lint/suspicious/noConsole: allow console
        console.log('Persisted typescript project to ' + directoryOnDiskToWriteTo)

        await this.writeSrcToVolume()

        for (const [filepath, fileContents] of Object.entries(this.extraFiles)) {
            await this.writeFileToVolume(RelativeFilePath.of(filepath), fileContents)
        }

        await this.addFilesToVolume()
        await this.writeVolumeToDisk(directoryOnDiskToWriteTo)

        return new PersistedTypescriptProject({
            runScripts: this.runScripts,
            directory: directoryOnDiskToWriteTo,
            srcDirectory: RelativeFilePath.of(this.packagePath),
            testDirectory: RelativeFilePath.of(TypescriptProject.TEST_DIRECTORY),
            distDirectory: RelativeFilePath.of(TypescriptProject.DIST_DIRECTORY),
            yarnBuildCommand: this.getYarnBuildCommand(),
            yarnFormatCommand: this.getYarnFormatCommand()
        })
    }

    private async writeSrcToVolume(): Promise<void> {
        for (const file of this.tsMorphProject.getSourceFiles()) {
            await this.writeFileToVolume(RelativeFilePath.of(file.getFilePath().slice(1)), file.getFullText())
        }
    }

    protected async writeFileToVolume(filepath: RelativeFilePath, fileContents: string): Promise<void> {
        const absoluteFilepath = `/${filepath}`
        await this.volume.promises.mkdir(path.dirname(absoluteFilepath), { recursive: true })
        await this.volume.promises.writeFile(absoluteFilepath, fileContents)
    }

    private async writeVolumeToDisk(directoryOnDiskToWriteTo: AbsoluteFilePath): Promise<void> {
        await this.writeVolumeToDiskRecursive({
            directoryOnDiskToWriteTo,
            directoryInVolume: '/'
        })
    }

    private async writeVolumeToDiskRecursive({
        directoryOnDiskToWriteTo,
        directoryInVolume
    }: {
        directoryOnDiskToWriteTo: string
        directoryInVolume: string
    }): Promise<void> {
        const contents = (await this.volume.promises.readdir(directoryInVolume, { withFileTypes: true })) as Dirent[]
        for (const file of contents) {
            const fullPathInVolume = path.join(directoryInVolume, file.name.toString())
            const fullPathOnDisk = path.join(directoryOnDiskToWriteTo, fullPathInVolume)
            if (file.isDirectory()) {
                await mkdir(fullPathOnDisk, { recursive: true })
                await this.writeVolumeToDiskRecursive({
                    directoryOnDiskToWriteTo,
                    directoryInVolume: fullPathInVolume
                })
            } else {
                const contents = await this.volume.promises.readFile(fullPathInVolume)
                await mkdir(path.dirname(fullPathOnDisk), { recursive: true })
                await writeFile(fullPathOnDisk, typeof contents === 'string' ? contents : new Uint8Array(contents))
            }
        }
    }

    protected abstract addFilesToVolume(): void | Promise<void>
    protected abstract getYarnFormatCommand(): string[]
    protected abstract getYarnBuildCommand(): string[]
}
