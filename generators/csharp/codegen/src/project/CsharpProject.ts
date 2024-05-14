import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { mkdir, readFile, writeFile } from "fs/promises";
import { template } from "lodash-es";
import path from "path";
import { AsIsFiles } from "../AsIs";
import { AbstractCsharpGeneratorContext } from "../cli";
import { BaseCsharpCustomConfigSchema } from "../custom-config";
import { CSharpFile } from "./CSharpFile";
import { File } from "./File";

const SRC_DIRECTORY_NAME = "src";
const AS_IS_DIRECTORY = path.join(__dirname, "asIs");

export const CORE_DIRECTORY_NAME = "Core";
/**
 * In memory representation of a C# project.
 */
export class CsharpProject {
    private testFiles: CSharpFile[] = [];
    private sourceFiles: CSharpFile[] = [];
    private coreFiles: File[] = [];
    private absolutePathToOutputDirectory: AbsoluteFilePath;
    public readonly filepaths: CsharpProjectFilepaths;

    public constructor(
        private readonly context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>,
        private readonly name: string
    ) {
        this.absolutePathToOutputDirectory = AbsoluteFilePath.of(this.context.config.output.path);
        this.filepaths = new CsharpProjectFilepaths(name);
    }

    public addCoreFiles(file: File): void {
        this.coreFiles.push(file);
    }

    public addSourceFiles(file: CSharpFile): void {
        this.sourceFiles.push(file);
    }

    public addTestFiles(file: CSharpFile): void {
        this.testFiles.push(file);
    }

    public async persist(): Promise<void> {
        const absolutePathToSrcDirectory = join(
            this.absolutePathToOutputDirectory,
            this.filepaths.getSourceFileDirectory()
        );
        this.context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });

        const absolutePathToProjectDirectory = await this.createProject({ absolutePathToSrcDirectory });
        const absolutePathToTestProjectDirectory = await this.createTestProject({ absolutePathToSrcDirectory });

        await loggingExeca(this.context.logger, "dotnet", ["new", "gitignore"], {
            doNotPipeOutput: true,
            cwd: this.absolutePathToOutputDirectory
        });

        for (const file of this.sourceFiles) {
            await file.write(absolutePathToProjectDirectory);
        }

        for (const file of this.testFiles) {
            await file.write(absolutePathToTestProjectDirectory);
        }

        for (const file of this.context.getAsIsFiles()) {
            this.coreFiles.push(await this.createCoreAsIsFile(file));
        }

        const githubWorkflowTemplate = (await readFile(getAsIsFilepath(AsIsFiles.CiYaml))).toString();
        const githubWorkflow = template(githubWorkflowTemplate)({
            projectName: this.name
        }).replaceAll("\\{", "{");
        const ghDir = join(this.absolutePathToOutputDirectory, RelativeFilePath.of(".github/workflows"));
        await mkdir(ghDir, { recursive: true });
        await writeFile(join(ghDir, RelativeFilePath.of("ci.yml")), githubWorkflow);

        await this.createCoreDirectory({ absolutePathToProjectDirectory });

        await loggingExeca(this.context.logger, "dotnet", ["csharpier", "."], {
            doNotPipeOutput: true,
            cwd: absolutePathToSrcDirectory,
            env: {
                DOTNET_CLI_TELEMETRY_OPTOUT: "1"
            }
        });
    }

    private async createProject({
        absolutePathToSrcDirectory
    }: {
        absolutePathToSrcDirectory: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        await loggingExeca(this.context.logger, "dotnet", ["new", "sln", "-n", this.name], {
            doNotPipeOutput: true,
            cwd: absolutePathToSrcDirectory
        });

        const absolutePathToProjectDirectory = join(absolutePathToSrcDirectory, RelativeFilePath.of(this.name));
        this.context.logger.debug(`mkdir ${absolutePathToProjectDirectory}`);
        await mkdir(absolutePathToProjectDirectory, { recursive: true });

        const templateCsProjContents = (await readFile(getAsIsFilepath(AsIsFiles.TemplateCsProj))).toString();
        await writeFile(
            join(absolutePathToProjectDirectory, RelativeFilePath.of(`${this.name}.csproj`)),
            templateCsProjContents
        );
        await loggingExeca(this.context.logger, "dotnet", ["sln", "add", `${this.name}/${this.name}.csproj`], {
            doNotPipeOutput: true,
            cwd: absolutePathToSrcDirectory
        });

        return absolutePathToProjectDirectory;
    }

    private async createTestProject({
        absolutePathToSrcDirectory
    }: {
        absolutePathToSrcDirectory: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const testProjectName = this.filepaths.getTestProjectName();
        const absolutePathToTestProject = join(
            this.absolutePathToOutputDirectory,
            this.filepaths.getTestFilesDirectory()
        );
        this.context.logger.debug(`mkdir ${absolutePathToTestProject}`);
        await mkdir(absolutePathToTestProject, { recursive: true });

        const testCsProjTemplateContents = (await readFile(getAsIsFilepath(AsIsFiles.TemplateTestCsProj))).toString();
        const testCsProjContents = template(testCsProjTemplateContents)({
            projectName: this.name
        });
        await writeFile(
            join(absolutePathToTestProject, RelativeFilePath.of(`${testProjectName}.csproj`)),
            testCsProjContents
        );
        await loggingExeca(
            this.context.logger,
            "dotnet",
            ["sln", "add", `${testProjectName}/${testProjectName}.csproj`],
            {
                doNotPipeOutput: true,
                cwd: absolutePathToSrcDirectory
            }
        );

        return absolutePathToTestProject;
    }

    private async createCoreDirectory({
        absolutePathToProjectDirectory
    }: {
        absolutePathToProjectDirectory: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const absolutePathToCoreDirectory = join(
            absolutePathToProjectDirectory,
            RelativeFilePath.of(CORE_DIRECTORY_NAME)
        );
        this.context.logger.debug(`mkdir ${absolutePathToCoreDirectory}`);
        await mkdir(absolutePathToCoreDirectory, { recursive: true });

        for (const file of this.coreFiles) {
            await file.write(absolutePathToCoreDirectory);
        }

        return absolutePathToCoreDirectory;
    }

    private async createCoreAsIsFile(filename: string): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        return new File(
            filename.replace(".Template", ""),
            RelativeFilePath.of(""),
            replaceTemplate({ contents, namespace: this.context.getNamespace() })
        );
    }
}

function replaceTemplate({ contents, namespace }: { contents: string; namespace: string }): string {
    return template(contents)({
        namespace
    });
}

function getAsIsFilepath(filename: string): string {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
}

class CsharpProjectFilepaths {
    constructor(private readonly name: string) {}

    public getProjectDirectory(): RelativeFilePath {
        return join(this.getSourceFileDirectory(), RelativeFilePath.of(this.name));
    }

    public getSourceFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of(SRC_DIRECTORY_NAME);
    }

    public getCoreFilesDirectory(): RelativeFilePath {
        return join(this.getProjectDirectory(), RelativeFilePath.of(CORE_DIRECTORY_NAME));
    }

    public getTestFilesDirectory(): RelativeFilePath {
        return join(this.getSourceFileDirectory(), RelativeFilePath.of(this.getTestProjectName()));
    }

    public getTestProjectName(): string {
        return `${this.name}.Test`;
    }
}
