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
            projectName: this.name,
            shouldWritePublishBlock: this.context.publishConfig != null,
            nugetTokenEnvvar:
                this.context.publishConfig?.apiKeyEnvironmentVariable == null ||
                this.context.publishConfig?.apiKeyEnvironmentVariable === ""
                    ? "NUGET_API_TOKEN"
                    : this.context.publishConfig.apiKeyEnvironmentVariable
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

        const csproj = new CsProj({
            version: this.context.config.output?.mode._visit({
                downloadFiles: () => undefined,
                github: (github) => github.version,
                publish: (publish) => publish.version,
                _other: () => undefined
            }),
            license: this.context.config.license?._visit({
                custom: (val) => {
                    return val.filename;
                },
                basic: (val) => {
                    return val.id;
                },
                _other: () => undefined
            }),
            githubUrl: this.context.config.output?.mode._visit({
                downloadFiles: () => undefined,
                github: (github) => github.repoUrl,
                publish: () => undefined,
                _other: () => undefined
            }),
            context: this.context
        });
        const templateCsProjContents = csproj.toString();
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
            replaceTemplate({ contents, namespace: this.context.getCoreNamespace() })
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

declare namespace CsProj {
    interface Args {
        version?: string;
        license?: string;
        githubUrl?: string;
        context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;
    }
}

const FOUR_SPACES = "    ";

class CsProj {
    private version: string | undefined;
    private license: string | undefined;
    private githubUrl: string | undefined;
    private context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;

    public constructor({ version, license, githubUrl, context }: CsProj.Args) {
        this.version = version;
        this.license = license;
        this.githubUrl = githubUrl;
        this.context = context;
    }

    public toString(): string {
        const propertyGroups = this.getPropertyGroups();
        const dependencies = this.getDependencies();
        return ` 
<Project Sdk="Microsoft.NET.Sdk">

    <PropertyGroup>
        <TargetFrameworks>net462;net8.0;net7.0;net6.0;netstandard2.0</TargetFrameworks>
        <ImplicitUsings>enable</ImplicitUsings>
        <NuGetAudit>false</NuGetAudit>
        <LangVersion>12</LangVersion>
        <Nullable>enable</Nullable>
        ${propertyGroups.join(`\n${FOUR_SPACES}${FOUR_SPACES}`)}
    </PropertyGroup>
    
    <PropertyGroup Condition="'$(TargetFramework)' == 'net6.0' Or '$(TargetFramework)' == 'net462' Or '$(TargetFramework)' == 'netstandard2.0'">
        <PolySharpIncludeRuntimeSupportedAttributes>true</PolySharpIncludeRuntimeSupportedAttributes>
    </PropertyGroup>
    
    <ItemGroup Condition="'$(TargetFramework)' == 'net462' Or '$(TargetFramework)' == 'netstandard2.0'">
        <PackageReference Include="Portable.System.DateTimeOnly" Version="8.0.1" />
    </ItemGroup>
    
    <ItemGroup Condition="'$(TargetFramework)' == 'net462'">
        <Reference Include="System.Net.Http" />
    </ItemGroup>
    
    <ItemGroup Condition="'$(TargetFramework)' == 'net7.0' Or '$(TargetFramework)' == 'net6.0' Or '$(TargetFramework)' == 'net462' Or '$(TargetFramework)' == 'netstandard2.0'">
        <PackageReference Include="PolySharp" Version="1.14.1">
            <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
            <PrivateAssets>all</PrivateAssets>
        </PackageReference>
    </ItemGroup>

    <ItemGroup>
        ${dependencies.join(`\n${FOUR_SPACES}${FOUR_SPACES}`)}
    </ItemGroup>

    <ItemGroup>
        <None Include="..\\..\\README.md" Pack="true" PackagePath=""/>
    </ItemGroup>
${this.getAdditionalItemGroups().join(`\n${FOUR_SPACES}`)}

</Project>
`;
    }

    private getDependencies(): string[] {
        const result: string[] = [];
        result.push('<PackageReference Include="OneOf" Version="3.0.263" />');
        result.push('<PackageReference Include="OneOf.Extended" Version="3.0.263" />');
        result.push('<PackageReference Include="System.Text.Json" Version="8.0.4" />');
        for (const [name, version] of Object.entries(this.context.getExtraDependencies())) {
            result.push(`<PackageReference Include="${name}" Version="${version}" />`);
        }
        return result;
    }

    private getPropertyGroups(): string[] {
        const result: string[] = [];
        if (this.version != null) {
            result.push(`<Version>${this.version}</Version>`);
        }

        result.push("<PackageReadmeFile>README.md</PackageReadmeFile>");

        if (this.license != null) {
            result.push(`<PackageLicenseFile>${this.license}</PackageLicenseFile>`);
        }

        if (this.githubUrl != null) {
            result.push(`<PackageProjectUrl>${this.githubUrl}</PackageProjectUrl>`);
        }
        return result;
    }

    private getAdditionalItemGroups(): string[] {
        const result: string[] = [];

        if (this.license != null) {
            result.push(`
<ItemGroup>
    <None Include="..\\..\\${this.license}" Pack="true" PackagePath=""/>
</ItemGroup>
`);
        }

        return result;
    }
}
