import { AbstractProject, FernGeneratorExec, File } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseGoCustomConfigSchema, resolveRootImportPath } from "@fern-api/go-ast";
import { loggingExeca } from "@fern-api/logging-execa";
import { OutputMode } from "@fern-fern/generator-exec-sdk/api";
import { mkdir, readFile } from "fs/promises";
import path from "path";
import { AbstractGoGeneratorContext } from "../context/AbstractGoGeneratorContext";
import { ModuleConfig } from "../module/ModuleConfig";
import { ModuleConfigWriter } from "../module/ModuleConfigWriter";
import { GoFile } from "./GoFile";

const AS_IS_DIRECTORY = path.join(__dirname, "asIs");

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

    public async writeRawFile(file: File): Promise<void> {
        await file.write(this.absolutePathToOutputDirectory);
    }

    public async persist({ tidy }: { tidy?: boolean } = {}): Promise<void> {
        this.context.logger.debug(`Writing go files to ${this.absolutePathToOutputDirectory}`);
        await this.writeGoMod();
        await this.writeInternalFiles();
        await this.writeRootAsIsFiles();
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
        // We write the go.mod file to disk upfront so that 'go fmt' can be run on the project.
        const moduleConfigWriter = new ModuleConfigWriter({ context: this.context, moduleConfig });
        await this.writeRawFile(moduleConfigWriter.generate());
    }

    private async writeGoFiles({ files }: { files: GoFile[] }): Promise<AbsoluteFilePath> {
        await this.mkdir(this.absolutePathToOutputDirectory);
        const outputDir = this.context.customConfig.packagePath
            ? path.join(this.absolutePathToOutputDirectory, this.context.customConfig.packagePath)
            : this.absolutePathToOutputDirectory;

        this.context.logger.debug(
            "goFiles",
            JSON.stringify(
                files.map((file) => file.getFullyQualifiedName()),
                null,
                2
            )
        );

        await Promise.all(files.map(async (file) => await file.write(AbsoluteFilePath.of(outputDir))));
        if (files.length > 0) {
            await loggingExeca(this.context.logger, "go", ["fmt", "./..."], {
                doNotPipeOutput: true,
                cwd: this.absolutePathToOutputDirectory
            });
        }
        return this.absolutePathToOutputDirectory;
    }

    private async writeAsIsFiles({
        filenames,
        getPackageName,
        getImportPath
    }: {
        filenames: string[];
        getPackageName: (dirname: string) => string;
        getImportPath: (dirname: string) => string;
    }): Promise<void> {
        for (const filename of filenames) {
            // Parse the directory path and filename from the full path
            const dirname = path.dirname(filename);
            const basename = path.basename(filename);
            const packageName = getPackageName(dirname);

            const file = await this.createAsIsFile({
                filename,
                templateVariables: {
                    PackageName: packageName,
                    RootImportPath: this.getRootImportPath()
                }
            });
            const goFilename = basename.replace(".go_", ".go");

            // Normalize dirname for root directory
            const normalizedDirname = dirname === "." ? "" : dirname;

            // Create a GoFile from the raw file content
            const goFile = new GoFile({
                node: [], // Empty node since this is raw content
                directory: RelativeFilePath.of(normalizedDirname),
                filename: goFilename,
                packageName: getPackageName(dirname),
                rootImportPath: this.getRootImportPath(),
                importPath: getImportPath(dirname),
                customConfig: this.context.customConfig
            });

            // Override the content with the raw file content
            const originalToFile = goFile.toFile.bind(goFile);
            goFile.toFile = () => new File(goFilename, RelativeFilePath.of(normalizedDirname), file.fileContents);

            this.addGoFiles(goFile);
        }
    }

    private async writeInternalFiles(): Promise<void> {
        await this.writeAsIsFiles({
            filenames: this.context.getInternalAsIsFiles(),
            getPackageName: () => "internal",
            getImportPath: (dirname) => this.getImportPath(dirname)
        });
    }

    private async writeRootAsIsFiles(): Promise<void> {
        await this.writeAsIsFiles({
            filenames: this.context.getRootAsIsFiles(),
            getPackageName: () => this.context.getRootPackageName(),
            getImportPath: () => this.getRootImportPath()
        });
    }

    public async writeSharedTestFiles(): Promise<AbsoluteFilePath> {
        const sharedTestFiles = await Promise.all(
            this.context.getTestAsIsFiles().map(async (filename) => {
                const dirname = path.dirname(filename);
                // For test files, we typically use the root package name if they're at root level
                const packageName = dirname === "." || dirname === "" ? this.context.getRootPackageName() : "test";

                return await this.createAsIsFile({
                    filename,
                    templateVariables: {
                        PackageName: packageName,
                        RootImportPath: this.getRootImportPath()
                    }
                });
            })
        );

        return await this.createGoDirectory({
            absolutePathToDirectory: this.absolutePathToOutputDirectory,
            files: sharedTestFiles
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

    private async createAsIsFile({
        filename,
        templateVariables = {}
    }: {
        filename: string;
        templateVariables?: Record<string, string>;
    }): Promise<File> {
        let contents = (await readFile(this.getAsIsFilepath(filename))).toString();

        // Process template variables
        for (const [key, value] of Object.entries(templateVariables)) {
            const doubleRegex = new RegExp(`\\{\\{ *\\.${key} *\\}\\}`, "g");
            contents = contents.replace(doubleRegex, value);
        }

        return new File(filename.replace(".go_", ".go"), RelativeFilePath.of(""), contents);
    }

    private getAsIsFilepath(filename: string): string {
        return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
    }

    private getRootImportPath(): string {
        const moduleConfig = this.getModuleConfig({ config: this.context.config });
        return moduleConfig.path;
    }

    private getImportPath(dirname: string): string {
        const rootImportPath = this.getRootImportPath();
        return dirname ? `${rootImportPath}/${dirname}` : rootImportPath;
    }

    private async runGoModTidy(): Promise<void> {
        await loggingExeca(this.context.logger, "go", ["mod", "tidy"], {
            doNotPipeOutput: true,
            cwd: this.absolutePathToOutputDirectory
        });
    }

    private getModuleConfig({ config }: { config: FernGeneratorExec.config.GeneratorConfig }): ModuleConfig {
        const outputMode = config.output.mode as OutputMode;
        switch (outputMode.type) {
            case "github":
            case "downloadFiles":
            case "publish": {
                const modulePath = resolveRootImportPath({ config, customConfig: this.context.customConfig });
                if (this.context.customConfig.module == null) {
                    return {
                        ...ModuleConfig.DEFAULT,
                        path: modulePath
                    };
                }
                return {
                    path: this.context.customConfig.module.path,
                    version: this.context.customConfig.module.version ?? ModuleConfig.DEFAULT.version,
                    imports: this.context.customConfig.module.imports ?? ModuleConfig.DEFAULT.imports
                };
            }
            default:
                assertNever(outputMode);
        }
    }

    private async mkdir(absolutePathToDirectory: AbsoluteFilePath): Promise<void> {
        this.context.logger.debug(`mkdir ${absolutePathToDirectory}`);
        await mkdir(absolutePathToDirectory, { recursive: true });
    }
}
