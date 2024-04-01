import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { mkdir, readFile, writeFile } from "fs/promises";
import { template } from "lodash-es";
import path from "path";
import { AbstractCsharpGeneratorContext } from "../cli";
import { CSharpFile } from "./CSharpFile";

const SRC_DIRECTORY_NAME = "src";
const AS_IS_DIRECTORY = path.join(__dirname, "asIs");

enum AsIsFiles {
    EnumConverter = "EnumConverter.cs",
    OneOfJsonConverter = "OneOfJsonConverter.cs",
    StringEnum = "StringEnum.cs",
    TemplateCsProj = "Template.csproj",
    TemplateTestCsProj = "Template.Test.csproj",
    TemplateTestClientCs = "TemplateTestClient.cs",
    UsingCs = "Using.cs"
}

/**
 * In memory representation of a C# project.
 */
export class CsharpProject {
    private sourceFiles: CSharpFile[] = [];

    public constructor(
        private readonly context: AbstractCsharpGeneratorContext<unknown>,
        private readonly name: string
    ) {}

    public addSourceFiles(file: CSharpFile): void {
        this.sourceFiles.push(file);
    }

    public async persist(path: AbsoluteFilePath): Promise<void> {
        const absolutePathToSrcDirectory = join(path, RelativeFilePath.of(SRC_DIRECTORY_NAME));
        await mkdir(absolutePathToSrcDirectory, { recursive: true });

        const absolutePathToProjectDirectory = await this.createProject({ absolutePathToSrcDirectory });
        await this.createTestProject({ absolutePathToSrcDirectory });

        await loggingExeca(this.context.logger, "dotnet", ["new", "gitignore"], {
            doNotPipeOutput: true,
            cwd: path
        });

        for (const file of this.sourceFiles) {
            await file.write(absolutePathToProjectDirectory);
        }
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
        const testProjectName = `${this.name}.Test`;
        const absolutePathToTestProject = join(absolutePathToSrcDirectory, RelativeFilePath.of(testProjectName));
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
}

function getAsIsFilepath(filename: string): string {
    return AbsoluteFilePath.of(path.join(AS_IS_DIRECTORY, filename));
}
