import { mkdir } from "fs/promises";

import { AbstractProject, File } from "@fern-api/base-generator";
import { GoFile } from "./GoFile";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema } from "@fern-api/go-ast";
import { AbstractGoGeneratorContext } from "../context/AbstractGoGeneratorContext";
import { loggingExeca } from "@fern-api/logging-execa";
import { ModuleConfigWriter } from "../module/ModuleConfigWriter";
import { ModuleConfig } from "../module/ModuleConfig";
import { GithubOutputMode, OutputMode } from "@fern-fern/generator-exec-sdk/api";
import { assertNever } from "@fern-api/core-utils";

/**
 * In memory representation of a Go project.
 */
export class GoProject extends AbstractProject<AbstractGoGeneratorContext<BaseGoCustomConfigSchema>> {
    private goFiles: Record<string, GoFile> = {};

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

    public async persist({ tidy }: { tidy?: boolean } = {}): Promise<void> {
        this.context.logger.debug(`Writing go files to ${this.absolutePathToOutputDirectory}`);
        await this.writeGoMod();
        await this.writeGoFiles({
            files: Object.values(this.goFiles).flat()
        });
        await this.writeRawFiles();
        if (tidy) {
            await this.runGoModTidy();
        }
        this.context.logger.debug(`Successfully wrote go files to ${this.absolutePathToOutputDirectory}`);
    }

    public async writeRawFile(file: File): Promise<void> {
        await file.write(this.absolutePathToOutputDirectory);
    }

    private async writeGoFiles({ files }: { files: GoFile[] }): Promise<AbsoluteFilePath> {
        await this.mkdir(this.absolutePathToOutputDirectory);
        await Promise.all(files.map(async (file) => await file.write(this.absolutePathToOutputDirectory)));
        if (files.length > 0) {
            await loggingExeca(this.context.logger, "go", ["fmt", "./..."], {
                doNotPipeOutput: true,
                cwd: this.absolutePathToOutputDirectory
            });
        }
        return this.absolutePathToOutputDirectory;
    }

    public async writeGoMod(): Promise<void> {
        const moduleConfig = this.getModuleConfig({ outputMode: this.context.config.output.mode });
        if (moduleConfig == null) {
            return;
        }
        // We write the go.mod file to disk upfront so that 'go fmt' can be run on the project.
        const moduleConfigWriter = new ModuleConfigWriter({ context: this.context, moduleConfig });
        await this.writeRawFile(moduleConfigWriter.generate());
    }

    private async runGoModTidy(): Promise<void> {
        await loggingExeca(this.context.logger, "go", ["mod", "tidy"], {
            doNotPipeOutput: true,
            cwd: this.absolutePathToOutputDirectory
        });
    }

    private getModuleConfig({ outputMode }: { outputMode: OutputMode }): ModuleConfig | undefined {
        const githubConfig = this.getGithubOutputMode({ outputMode });
        if (githubConfig == null && this.context.customConfig.module == null) {
            return undefined;
        }
        if (githubConfig == null) {
            return this.context.customConfig.module;
        }
        if (this.context.customConfig.module == null) {
            // A GitHub configuration was provided, so the module config should use
            // the GitHub configuration's repository url.
            const modulePath = githubConfig.repoUrl.replace("https://", "");
            return {
                ...ModuleConfig.DEFAULT,
                path: modulePath
            };
        }
        return {
            path: this.context.customConfig.module.path,
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
