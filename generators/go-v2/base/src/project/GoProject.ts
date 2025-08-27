import { AbstractProject, FernGeneratorExec, File } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema, resolveRootImportPath } from "@fern-api/go-ast";
import { loggingExeca } from "@fern-api/logging-execa";
import { GithubOutputMode, OutputMode } from "@fern-fern/generator-exec-sdk/api";
import { mkdir, readFile } from "fs/promises";
import path from "path";
import { AbstractGoGeneratorContext } from "../context/AbstractGoGeneratorContext";
import { ModuleConfig } from "../module/ModuleConfig";
import { ModuleConfigWriter } from "../module/ModuleConfigWriter";
import { GoFile } from "./GoFile";

const AS_IS_DIRECTORY = path.join(__dirname, "asIs");
const INTERNAL_DIRECTORY = "internal";

/**
 * In memory representation of a Go project.
 */
export class GoProject extends AbstractProject<AbstractGoGeneratorContext<BaseGoCustomConfigSchema>> {
    private goFiles: Record<string, GoFile> = {};
    private internalFiles: File[] = [];

    public constructor({ context }: { context: AbstractGoGeneratorContext<BaseGoCustomConfigSchema> }) {
        super(context);
    }

    public addGoFiles(file: GoFile): void {
        const key = file.getFullyQualifiedName();
        if (this.goFiles[key] != null) {
            this.goFiles[key].merge(file);
            return;
        }
        this.goFiles[key] = file;
    }

    public async writeRawFile(file: File): Promise<void> {
        await file.write(this.absolutePathToOutputDirectory);
    }

    public async persist({ tidy }: { tidy?: boolean } = {}): Promise<void> {
        this.context.logger.debug(`Writing go files to ${this.absolutePathToOutputDirectory}`);
        await this.writeGoMod();
        await this.writeInternalFiles();
        await this.writeGoFiles({
            files: Object.values(this.goFiles).flat()
        });
        await this.writeRawFiles();
        if (tidy) {
            await this.runGoModTidy();
        }
        this.context.logger.debug(`Successfully wrote go files to ${this.absolutePathToOutputDirectory}`);
    }

    public async writeGoMod(): Promise<void> {
        const moduleConfig = this.getModuleConfig({ config: this.context.config });
        if (moduleConfig == null) {
            return;
        }
        // We write the go.mod file to disk upfront so that 'go fmt' can be run on the project.
        const moduleConfigWriter = new ModuleConfigWriter({ context: this.context, moduleConfig });
        await this.writeRawFile(moduleConfigWriter.generate());
    }

    private async writeGoFiles({ files }: { files: GoFile[] }): Promise<AbsoluteFilePath> {
        await this.mkdir(this.absolutePathToOutputDirectory);
        const outputDir = this.context.customConfig.packagePath
            ? path.join(this.absolutePathToOutputDirectory, this.context.customConfig.packagePath)
            : this.absolutePathToOutputDirectory;

        await Promise.all(files.map(async (file) => await file.write(AbsoluteFilePath.of(outputDir))));
        if (files.length > 0) {
            await loggingExeca(this.context.logger, "go", ["fmt", "./..."], {
                doNotPipeOutput: true,
                cwd: this.absolutePathToOutputDirectory
            });
        }
        return this.absolutePathToOutputDirectory;
    }

    private async writeInternalFiles(): Promise<AbsoluteFilePath> {
        for (const filename of this.context.getInternalAsIsFiles()) {
            this.internalFiles.push(
                await this.createAsIsFile({
                    filename
                })
            );
        }
        return await this.createGoDirectory({
            absolutePathToDirectory: join(this.absolutePathToOutputDirectory),
            files: this.internalFiles
        });
    }

    private async createGoDirectory({
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

    private async createAsIsFile({ filename }: { filename: string }): Promise<File> {
        const contents = (await readFile(this.getAsIsFilepath(filename))).toString();
        return new File(filename.replace(".go_", ".go"), RelativeFilePath.of(""), contents);
    }

    private getAsIsFilepath(filename: string): string {
        return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
    }

    private async runGoModTidy(): Promise<void> {
        await loggingExeca(this.context.logger, "go", ["mod", "tidy"], {
            doNotPipeOutput: true,
            cwd: this.absolutePathToOutputDirectory
        });
    }

    private getModuleConfig({
        config
    }: {
        config: FernGeneratorExec.config.GeneratorConfig;
    }): ModuleConfig | undefined {
        const githubConfig = this.getGithubOutputMode({ outputMode: config.output.mode });
        if (githubConfig == null && this.context.customConfig.module == null) {
            return undefined;
        }
        if (githubConfig == null) {
            return this.context.customConfig.module;
        }
        const modulePath = resolveRootImportPath({ config, customConfig: this.context.customConfig });
        if (this.context.customConfig.module == null) {
            return {
                ...ModuleConfig.DEFAULT,
                path: modulePath
            };
        }
        return {
            path: modulePath,
            version: this.context.customConfig.module.version,
            imports: this.context.customConfig.module.imports ?? ModuleConfig.DEFAULT.imports
        };
    }

    private getGithubOutputMode({ outputMode }: { outputMode: OutputMode }): GithubOutputMode | undefined {
        switch (outputMode.type) {
            case "github":
                return outputMode;
            case "publish":
            case "downloadFiles":
                return undefined;
            default:
                assertNever(outputMode);
        }
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }
}
