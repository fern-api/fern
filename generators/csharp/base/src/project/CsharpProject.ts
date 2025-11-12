import { AbstractProject, FernGeneratorExec, File, SourceFetcher } from "@fern-api/base-generator";
import { WithGeneration } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { access, mkdir, readFile, unlink, writeFile } from "fs/promises";
import { template } from "lodash-es";
import path from "path";
import { AsIsFiles } from "../AsIs";
import { GeneratorContext } from "../context/GeneratorContext";
import { findDotnetToolPath } from "../findDotNetToolPath";
import { CSharpFile } from "./CSharpFile";

export const CORE_DIRECTORY_NAME = "Core";
export const PUBLIC_CORE_DIRECTORY_NAME = "Public";
/**
 * In memory representation of a C# project.
 */
export class CsharpProject extends AbstractProject<GeneratorContext> {
    private name: string;
    private sourceFiles: CSharpFile[] = [];
    private testFiles: CSharpFile[] = [];
    private coreFiles: File[] = [];
    private coreTestFiles: File[] = [];
    private publicCoreFiles: File[] = [];
    private publicCoreTestFiles: File[] = [];
    private testUtilFiles: File[] = [];
    private sourceFetcher: SourceFetcher;

    public constructor({
        context,
        name
    }: {
        context: GeneratorContext;
        name: string;
    }) {
        super(context);
        this.name = name;
        this.sourceFetcher = new SourceFetcher({
            context: this.context,
            sourceConfig: this.context.ir.sourceConfig
        });
    }
    protected get generation() {
        return this.context.generation;
    }
    protected get namespaces() {
        return this.generation.namespaces;
    }
    protected get registry() {
        return this.generation.registry;
    }
    protected get settings() {
        return this.generation.settings;
    }
    protected get constants() {
        return this.generation.constants;
    }
    protected get names() {
        return this.generation.names;
    }
    protected get model() {
        return this.generation.model;
    }
    protected get format() {
        return this.generation.format;
    }
    protected get csharp() {
        return this.generation.csharp;
    }
    protected get Types() {
        return this.generation.Types;
    }
    protected get System() {
        return this.generation.extern.System;
    }
    protected get NUnit() {
        return this.generation.extern.NUnit;
    }
    protected get OneOf() {
        return this.generation.extern.OneOf;
    }
    protected get Google() {
        return this.generation.extern.Google;
    }
    protected get WireMock() {
        return this.generation.extern.WireMock;
    }
    protected get Primitive() {
        return this.generation.Primitive;
    }
    protected get Value() {
        return this.generation.Value;
    }
    protected get Collection() {
        return this.generation.Collection;
    }
    protected get Special() {
        return this.generation.Special;
    }

    public addCoreFiles(file: File): void {
        this.coreFiles.push(file);
    }

    public addCoreTestFiles(file: File): void {
        this.coreTestFiles.push(file);
    }

    public addPublicCoreFiles(file: File): void {
        this.publicCoreFiles.push(file);
    }

    public addPublicCoreTestFiles(file: File): void {
        this.publicCoreTestFiles.push(file);
    }

    public addSourceFiles(file: CSharpFile): void {
        this.sourceFiles.push(file);
    }

    public addTestFiles(file: CSharpFile): void {
        this.testFiles.push(file);
    }

    private async dotnetFormat(
        absolutePathToSrcDirectory: AbsoluteFilePath,
        absolutePathToProjectDirectory: AbsoluteFilePath,
        editorConfig: string
    ): Promise<void> {
        // write a temporary '.editorconfig' file to the absolutePathToSrcDirectory
        // so we can use dotnet format to pre-format the project (ie, optimize namespace usage, scoping, etc)
        const editorConfigPath = join(absolutePathToSrcDirectory, RelativeFilePath.of(".editorconfig"));
        await writeFile(editorConfigPath, editorConfig);

        // patch the csproj file to only target net8.0 (dotnet format gets weird with multiple target frameworks)
        const csprojPath = join(absolutePathToProjectDirectory, RelativeFilePath.of(`${this.name}.csproj`));
        const csprojContents = (await readFile(csprojPath)).toString();

        // write modified (temporary) csproj file
        await writeFile(
            csprojPath,
            csprojContents
                .replace(
                    /<TargetFrameworks>.*<\/TargetFrameworks>/,
                    `<TargetFrameworks>netstandard2.0</TargetFrameworks>`
                )
                .replace(/<ImplicitUsings>enable<\/ImplicitUsings>/, `<ImplicitUsings>disable</ImplicitUsings>`)
                .replace(/<LangVersion>12<\/LangVersion>/, `<LangVersion>11</LangVersion>`)
                .replace(/<\/Project>/, `<ItemGroup><Using Include="System" /></ItemGroup></Project>`)
        );

        // call dotnet format
        await loggingExeca(this.context.logger, "dotnet", ["format", "--severity", "error"], {
            doNotPipeOutput: false,
            cwd: absolutePathToSrcDirectory
        });

        await writeFile(csprojPath, csprojContents);
        // remove the temporary editorconfig file
        await unlink(editorConfigPath);

        await writeFile(csprojPath, csprojContents);
    }

    private async csharpier(absolutePathToSrcDirectory: AbsoluteFilePath): Promise<void> {
        const csharpier = findDotnetToolPath("csharpier");
        await loggingExeca(
            this.context.logger,
            csharpier,
            ["format", ".", "--no-msbuild-check", "--skip-validation", "--compilation-errors-as-warnings"],
            {
                doNotPipeOutput: false,
                cwd: absolutePathToSrcDirectory
            }
        );
    }

    public async persist(): Promise<void> {
        const absolutePathToSrcDirectory = join(this.absolutePathToOutputDirectory, this.constants.folders.sourceFiles);
        this.context.logger.debug(`mkdir ${absolutePathToSrcDirectory}`);
        await mkdir(absolutePathToSrcDirectory, { recursive: true });

        const absolutePathToProjectDirectory = await this.createProject({ absolutePathToSrcDirectory });
        const absolutePathToTestProjectDirectory = await this.createTestProject({ absolutePathToSrcDirectory });

        for (const file of this.sourceFiles) {
            await file.write(absolutePathToProjectDirectory);
        }

        for (const file of this.testFiles) {
            await file.write(absolutePathToTestProjectDirectory);
        }

        await this.createRawFiles();

        for (const filename of this.context.getCoreAsIsFiles()) {
            this.coreFiles.push(
                await this.createAsIsFile({
                    filename,
                    namespace: this.namespaces.core
                })
            );
        }

        if (this.context.shouldCreateCustomPagination()) {
            this.coreFiles.push(...(await this.createCustomPagerAsIsFiles()));
        }

        for (const filename of this.context.getCoreTestAsIsFiles()) {
            this.coreTestFiles.push(
                await this.createAsIsTestFile({
                    filename,
                    namespace: this.namespaces.root
                })
            );
        }

        for (const filename of this.context.getPublicCoreAsIsFiles()) {
            this.publicCoreFiles.push(
                await this.createAsIsFile({
                    filename,
                    namespace: this.namespaces.root
                })
            );
        }

        if (this.context.hasWebSocketEndpoints) {
            for (const filename of this.context.getAsyncCoreAsIsFiles()) {
                this.coreFiles.push(
                    await this.createAsIsFile({
                        filename,
                        namespace: this.namespaces.core
                    })
                );
            }
        }

        for (const file of this.context.getAsIsTestUtils()) {
            this.testUtilFiles.push(await this.createTestUtilsAsIsFile(file));
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
        await this.createTestUtilsDirectory({ absolutePathToTestProjectDirectory });
        await this.createCoreTestDirectory({ absolutePathToTestProjectDirectory });
        await this.createPublicCoreDirectory({ absolutePathToProjectDirectory });

        if (this.settings.useDotnetFormat) {
            // apply dotnet analyzer and formatter pass 1
            await this.dotnetFormat(
                absolutePathToSrcDirectory,
                absolutePathToProjectDirectory,
                `[*.cs]
  dotnet_diagnostic.IDE0001.severity = error
  dotnet_diagnostic.IDE0002.severity = error 
  dotnet_diagnostic.IDE0003.severity = error 
  dotnet_diagnostic.IDE0004.severity = error  
  dotnet_diagnostic.IDE0007.severity = error
  dotnet_diagnostic.IDE0017.severity = error
  dotnet_diagnostic.IDE0018.severity = error
  `
            );
            // apply dotnet analyzer and formatter pass 2
            await this.dotnetFormat(
                absolutePathToSrcDirectory,
                absolutePathToProjectDirectory,
                `[*.cs]
dotnet_diagnostic.IDE0005.severity = error          
          `
            );
        }

        // format the code cleanly using csharpier
        await this.csharpier(absolutePathToSrcDirectory);
    }

    private async createProject({
        absolutePathToSrcDirectory
    }: {
        absolutePathToSrcDirectory: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        await access(path.join(absolutePathToSrcDirectory, `${this.name}.sln`)).catch(() =>
            loggingExeca(this.context.logger, "dotnet", ["new", "sln", "-n", this.name, "--no-update-check"], {
                doNotPipeOutput: true,
                cwd: absolutePathToSrcDirectory
            })
        );

        const absolutePathToProjectDirectory = join(absolutePathToSrcDirectory, RelativeFilePath.of(this.name));
        this.context.logger.debug(`mkdir ${absolutePathToProjectDirectory}`);
        await mkdir(absolutePathToProjectDirectory, { recursive: true });

        const absolutePathToProtoDirectory = join(
            this.absolutePathToOutputDirectory,
            RelativeFilePath.of(this.generation.constants.folders.protobuf)
        );
        const protobufSourceFilePaths = await this.sourceFetcher.copyProtobufSources(absolutePathToProtoDirectory);
        const csproj = new CsProj({
            name: this.name,
            license: this.context.config.license,
            githubUrl: this.context.config.output?.mode._visit({
                downloadFiles: () => undefined,
                github: (github) => github.repoUrl,
                publish: () => undefined,
                _other: () => undefined
            }),
            context: this.context,
            protobufSourceFilePaths
        });
        const templateCsProjContents = csproj.toString();
        await writeFile(
            join(absolutePathToProjectDirectory, RelativeFilePath.of(`${this.name}.csproj`)),
            templateCsProjContents
        );

        await writeFile(
            join(absolutePathToProjectDirectory, RelativeFilePath.of(`${this.name}.Custom.props`)),
            (await readFile(getAsIsFilepath(AsIsFiles.CustomProps))).toString()
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
        const testProjectName = this.names.files.testProject;
        const absolutePathToTestProject = join(this.absolutePathToOutputDirectory, this.constants.folders.testFiles);
        await mkdir(absolutePathToTestProject, { recursive: true });

        const testCsProjTemplateContents = (
            await readFile(getAsIsFilepath(AsIsFiles.Test.TemplateTestCsProj))
        ).toString();
        const testCsProjContents = template(testCsProjTemplateContents)({
            projectName: this.name,
            testProjectName
        });
        await writeFile(
            join(absolutePathToTestProject, RelativeFilePath.of(`${testProjectName}.csproj`)),
            testCsProjContents
        );
        await writeFile(
            join(absolutePathToTestProject, RelativeFilePath.of(`${testProjectName}.Custom.props`)),
            (await readFile(getAsIsFilepath(AsIsFiles.Test.TestCustomProps))).toString()
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

    private async createCoreTestDirectory({
        absolutePathToTestProjectDirectory
    }: {
        absolutePathToTestProjectDirectory: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const absolutePathToCoreTestDirectory = join(
            absolutePathToTestProjectDirectory,
            RelativeFilePath.of(CORE_DIRECTORY_NAME)
        );
        this.context.logger.debug(`mkdir ${absolutePathToCoreTestDirectory}`);
        await mkdir(absolutePathToCoreTestDirectory, { recursive: true });

        for (const file of this.coreTestFiles) {
            await file.write(absolutePathToCoreTestDirectory);
        }

        return absolutePathToCoreTestDirectory;
    }

    /*
     * Unused until we start generating tests for the public core files.
     */
    private async createPublicCoreTestDirectory({
        absolutePathToTestProjectDirectory
    }: {
        absolutePathToTestProjectDirectory: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const absolutePathToPublicCoreTestDirectory = join(
            absolutePathToTestProjectDirectory,
            RelativeFilePath.of(CORE_DIRECTORY_NAME),
            RelativeFilePath.of(PUBLIC_CORE_DIRECTORY_NAME)
        );
        this.context.logger.debug(`mkdir ${absolutePathToPublicCoreTestDirectory}`);
        await mkdir(absolutePathToPublicCoreTestDirectory, { recursive: true });

        for (const file of this.publicCoreTestFiles) {
            await file.write(absolutePathToPublicCoreTestDirectory);
        }

        return absolutePathToPublicCoreTestDirectory;
    }

    /*
     * Unused after removing unnecessary utils file.
     */
    private async createTestUtilsDirectory({
        absolutePathToTestProjectDirectory
    }: {
        absolutePathToTestProjectDirectory: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const absolutePathToTestUtilsDirectory = join(absolutePathToTestProjectDirectory, RelativeFilePath.of("Utils"));
        this.context.logger.debug(`mkdir ${absolutePathToTestUtilsDirectory}`);
        await mkdir(absolutePathToTestUtilsDirectory, { recursive: true });

        for (const file of this.testUtilFiles) {
            await file.write(absolutePathToTestUtilsDirectory);
        }

        return absolutePathToTestUtilsDirectory;
    }

    private async createPublicCoreDirectory({
        absolutePathToProjectDirectory
    }: {
        absolutePathToProjectDirectory: AbsoluteFilePath;
    }): Promise<AbsoluteFilePath> {
        const absolutePathToPublicCoreDirectory = join(
            absolutePathToProjectDirectory,
            RelativeFilePath.of(CORE_DIRECTORY_NAME),
            RelativeFilePath.of(PUBLIC_CORE_DIRECTORY_NAME)
        );
        this.context.logger.debug(`mkdir ${absolutePathToPublicCoreDirectory}`);
        await mkdir(absolutePathToPublicCoreDirectory, { recursive: true });

        for (const file of this.publicCoreFiles) {
            await file.write(absolutePathToPublicCoreDirectory);
        }

        return absolutePathToPublicCoreDirectory;
    }

    private async createAsIsTestFile({ filename, namespace }: { filename: string; namespace: string }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        return new File(
            filename.replace("test/", "").replace(".Template", ""),
            RelativeFilePath.of(""),
            replaceTemplate({
                contents,
                variables: {
                    grpc: this.context.hasGrpcEndpoints(),
                    idempotencyHeaders: this.context.hasIdempotencyHeaders(),
                    namespace,
                    testNamespace: this.namespaces.test,
                    additionalProperties: this.settings.generateNewAdditionalProperties,
                    context: this.context,
                    namespaces: this.namespaces
                }
            })
        );
    }

    private async createAsIsFile({ filename, namespace }: { filename: string; namespace: string }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        return new File(
            filename.replace(".Template", ""),
            RelativeFilePath.of(""),
            replaceTemplate({
                contents,
                variables: {
                    grpc: this.context.hasGrpcEndpoints(),
                    idempotencyHeaders: this.context.hasIdempotencyHeaders(),
                    namespace,
                    additionalProperties: this.settings.generateNewAdditionalProperties,
                    context: this.context,
                    namespaces: this.namespaces
                }
            })
        );
    }

    private async createCustomPagerAsIsFiles(): Promise<File[]> {
        const customPagerFileName = AsIsFiles.CustomPager;
        const customPagerName = this.generation.names.classes.customPager;
        const customPagerContents = await readFile(getAsIsFilepath(customPagerFileName), {
            encoding: "utf-8"
        });
        const customPagerContextFileName = AsIsFiles.CustomPagerContext;
        const customPagerContextContents = await readFile(getAsIsFilepath(customPagerContextFileName), {
            encoding: "utf-8"
        });
        return [
            new File(
                customPagerFileName.replace(".Template", "").replace("CustomPager", customPagerName),
                RelativeFilePath.of(""),
                replaceTemplate({
                    contents: customPagerContents,
                    variables: {
                        grpc: this.context.hasGrpcEndpoints(),
                        idempotencyHeaders: this.context.hasIdempotencyHeaders(),
                        namespace: this.namespaces.core,
                        additionalProperties: this.settings.generateNewAdditionalProperties,
                        context: this.context,
                        namespaces: this.namespaces
                    }
                }).replaceAll("CustomPager", customPagerName)
            ),
            new File(
                customPagerContextFileName.replace(".Template", "").replace("CustomPager", customPagerName),
                RelativeFilePath.of(""),
                replaceTemplate({
                    contents: customPagerContextContents,
                    variables: {
                        grpc: this.context.hasGrpcEndpoints(),
                        idempotencyHeaders: this.context.hasIdempotencyHeaders(),
                        namespace: this.namespaces.core,
                        additionalProperties: this.settings.generateNewAdditionalProperties,
                        context: this.context,
                        namespaces: this.namespaces
                    }
                }).replaceAll("CustomPager", customPagerName)
            )
        ];
    }

    private async createTestUtilsAsIsFile(filename: string): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        return new File(
            filename.replace("test/", "").replace("Utils/", "").replace(".Template", ""),
            RelativeFilePath.of(""),
            replaceTemplate({
                contents,
                variables: {
                    grpc: this.context.hasGrpcEndpoints(),
                    idempotencyHeaders: this.context.hasIdempotencyHeaders(),
                    namespace: this.namespaces.testUtils,
                    testNamespace: this.namespaces.test,
                    additionalProperties: this.settings.generateNewAdditionalProperties,
                    context: this.context,
                    namespaces: this.namespaces
                }
            })
        );
    }

    private async createRawFiles(): Promise<void> {
        for (const filename of this.context.getRawAsIsFiles()) {
            this.addRawFiles(await this.createRawAsIsFile({ filename }));
        }
        await this.writeRawFiles();
    }

    private async createRawAsIsFile({ filename }: { filename: string }): Promise<File> {
        const contents = (await readFile(getAsIsFilepath(filename))).toString();
        filename = filename.replace(".Template", "");
        return new File(filename, RelativeFilePath.of(""), contents);
    }
}

function replaceTemplate({ contents, variables }: { contents: string; variables: Record<string, unknown> }): string {
    return template(contents)(variables);
}

function getAsIsFilepath(filename: string): string {
    return AbsoluteFilePath.of(path.join(__dirname, "asIs", filename));
}

declare namespace CsProj {
    interface Args {
        name: string;
        version?: string;
        license?: FernGeneratorExec.LicenseConfig;
        githubUrl?: string;
        context: GeneratorContext;
        protobufSourceFilePaths: RelativeFilePath[];
    }
}

class CsProj extends WithGeneration {
    private name: string;
    private license: FernGeneratorExec.LicenseConfig | undefined;
    private githubUrl: string | undefined;
    private packageId: string | undefined;
    private context: GeneratorContext;
    private protobufSourceFilePaths: RelativeFilePath[];

    public constructor({ name, license, githubUrl, context, protobufSourceFilePaths }: CsProj.Args) {
        super(context.generation);
        this.name = name;
        this.license = license;
        this.githubUrl = githubUrl;
        this.context = context;
        this.protobufSourceFilePaths = protobufSourceFilePaths;
        this.packageId = this.generation.settings.packageId;
    }

    public override toString(): string {
        const projectGroup = this.getProjectGroup();
        const dependencies = this.getDependencies();
        return `
<Project Sdk="Microsoft.NET.Sdk">
${projectGroup.join("\n")}

    <PropertyGroup>
        <UsePortableDateOnly>false</UsePortableDateOnly>
    </PropertyGroup>
    <PropertyGroup Condition="'$(TargetFramework)' == 'net462' Or '$(TargetFramework)' == 'netstandard2.0'">
        <DefineConstants>$(DefineConstants);USE_PORTABLE_DATE_ONLY</DefineConstants>
        <UsePortableDateOnly>true</UsePortableDateOnly>
    </PropertyGroup>
    <ItemGroup Condition="'$(TargetFramework)' == 'net462' Or '$(TargetFramework)' == 'netstandard2.0'">
      <Using Include="System.Net.Http" />
      <Using Include="System.Collections.Generic" />
      <Using Include="System.Linq" />
      <Using Include="System.Threading" />
      <Using Include="System.Threading.Tasks" />
    </ItemGroup>
    <ItemGroup Condition="'$(UsePortableDateOnly)' == 'true'">
        <PackageReference Include="Portable.System.DateTimeOnly" Version="8.0.2" />
    </ItemGroup>
    <ItemGroup Condition="'$(UsePortableDateOnly)' == 'false'">
        <Compile Remove="Core\\DateOnlyConverter.cs" />
    </ItemGroup>
    <ItemGroup>
        ${dependencies.join(`\n${this.generation.constants.formatting.indent}${this.generation.constants.formatting.indent}`)}
        ${this.getSseDependencies().join(`\n${this.generation.constants.formatting.indent}`)}
        ${this.getWebSocketAsyncDependencies().join(`\n${this.generation.constants.formatting.indent}`)}
    </ItemGroup>
${this.getProtobufDependencies(this.protobufSourceFilePaths).join(`\n${this.generation.constants.formatting.indent}`)}
    <ItemGroup>
        <None Include="..\\..\\README.md" Pack="true" PackagePath=""/>
    </ItemGroup>
${this.getAdditionalItemGroups().join(`\n${this.generation.constants.formatting.indent}`)}
    <ItemGroup>
        <AssemblyAttribute Include="System.Runtime.CompilerServices.InternalsVisibleTo">
            <_Parameter1>${this.generation.names.files.testProject}</_Parameter1>
        </AssemblyAttribute>
    </ItemGroup>

    <Import Project="${this.name}.Custom.props" Condition="Exists('${this.name}.Custom.props')" />
</Project>
`;
    }

    private getDependencies(): string[] {
        const result: string[] = [];
        result.push('<PackageReference Include="PolySharp" Version="1.15.0">');
        result.push(
            `${this.generation.constants.formatting.indent}<IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>`
        );
        result.push(`${this.generation.constants.formatting.indent}<PrivateAssets>all</PrivateAssets>`);
        result.push("</PackageReference>");
        result.push('<PackageReference Include="OneOf" Version="3.0.271" />');
        result.push('<PackageReference Include="OneOf.Extended" Version="3.0.271" />');
        result.push('<PackageReference Include="System.Text.Json" Version="8.0.5" />');
        result.push('<PackageReference Include="System.Net.Http" Version="[4.3.4,)" />');
        result.push('<PackageReference Include="System.Text.RegularExpressions" Version="[4.3.1,)" />');
        for (const [name, version] of Object.entries(this.generation.settings.extraDependencies)) {
            result.push(`<PackageReference Include="${name}" Version="${version}" />`);
        }
        return result;
    }

    /**
     * Adds the nuget dependencies for the websocket api client.
     *
     * @returns an array of strings that represent the nuget dependencies.
     */
    private getWebSocketAsyncDependencies(): string[] {
        return this.context.hasWebSocketEndpoints
            ? [
                  '    <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="8.0.2" />',
                  '    <PackageReference Include="Microsoft.IO.RecyclableMemoryStream" Version="3.0.1" />'
              ]
            : [];
    }

    private getSseDependencies(): string[] {
        return this.context.hasSseEndpoints
            ? ['    <PackageReference Include="System.Net.ServerSentEvents" Version="9.0.9" />']
            : [];
    }

    private getProtobufDependencies(protobufSourceFilePaths: RelativeFilePath[]): string[] {
        if (protobufSourceFilePaths.length === 0) {
            return [];
        }

        const pathToProtobufDirectory = `..\\..\\${this.generation.constants.folders.protobuf}`;

        const result: string[] = [];

        result.push("");
        result.push("<ItemGroup>");
        result.push('    <PackageReference Include="Google.Protobuf" Version="3.27.2" />');
        result.push('    <PackageReference Include="Grpc.Net.Client" Version="2.63.0" />');
        result.push('    <PackageReference Include="Grpc.Net.ClientFactory" Version="2.63.0" />');
        result.push('    <PackageReference Include="Grpc.Tools" Version="2.64.0">');
        result.push(
            "        <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>"
        );
        result.push("        <PrivateAssets>all</PrivateAssets>");
        result.push("    </PackageReference>");
        result.push("</ItemGroup>\n");

        result.push("<ItemGroup>");
        for (const protobufSourceFilePath of protobufSourceFilePaths) {
            const protobufSourceWindowsPath = this.relativePathToWindowsPath(protobufSourceFilePath);
            result.push(
                `    <Protobuf Include="${pathToProtobufDirectory}\\${protobufSourceWindowsPath}" GrpcServices="Client" ProtoRoot="${pathToProtobufDirectory}">`
            );
            result.push("    </Protobuf>");
        }
        result.push("</ItemGroup>\n");

        return result;
    }

    private getProjectGroup(): string[] {
        const result: string[] = [];

        result.push(`${this.generation.constants.formatting.indent}<PropertyGroup>`);
        if (this.packageId) {
            result.push(
                `${this.generation.constants.formatting.indent}${this.generation.constants.formatting.indent}<PackageId>${this.packageId}</PackageId>`
            );
        }
        result.push(
            `${this.generation.constants.formatting.indent}${this.generation.constants.formatting.indent}<TargetFrameworks>net462;net8.0;net7.0;net6.0;netstandard2.0</TargetFrameworks>`
        );
        result.push(
            `${this.generation.constants.formatting.indent}${this.generation.constants.formatting.indent}<ImplicitUsings>enable</ImplicitUsings>`
        );
        result.push(
            `${this.generation.constants.formatting.indent}${this.generation.constants.formatting.indent}<LangVersion>12</LangVersion>`
        );
        result.push(
            `${this.generation.constants.formatting.indent}${this.generation.constants.formatting.indent}<Nullable>enable</Nullable>`
        );

        const propertyGroups = this.getPropertyGroups();
        for (const propertyGroup of propertyGroups) {
            result.push(
                `${this.generation.constants.formatting.indent}${this.generation.constants.formatting.indent}${propertyGroup}`
            );
        }
        result.push(`${this.generation.constants.formatting.indent}</PropertyGroup>`);

        return result;
    }

    private getPropertyGroups(): string[] {
        const result: string[] = [];
        if (this.context.version != null) {
            result.push(`<Version>${this.context.version}</Version>`);
            result.push("<AssemblyVersion>$(Version)</AssemblyVersion>");
            result.push("<FileVersion>$(Version)</FileVersion>");
        }

        result.push("<PackageReadmeFile>README.md</PackageReadmeFile>");

        if (this.license) {
            result.push(
                this.license._visit<string>({
                    basic: (value) => `<PackageLicenseExpression>${value.id}</PackageLicenseExpression>`,
                    custom: (value) => `<PackageLicenseFile>${value.filename}</PackageLicenseFile>`,
                    _other: () => {
                        throw new Error("Unknown license type");
                    }
                })
            );
        }

        if (this.githubUrl != null) {
            result.push(`<PackageProjectUrl>${this.githubUrl}</PackageProjectUrl>`);
        }
        result.push("<PolySharpIncludeRuntimeSupportedAttributes>true</PolySharpIncludeRuntimeSupportedAttributes>");
        return result;
    }

    private getAdditionalItemGroups(): string[] {
        const result: string[] = [];

        if (this.license != null && this.license.type === "custom") {
            result.push(`
    <ItemGroup>
        <None Include="..\\..\\${this.license.filename}" Pack="true" PackagePath=""/>
    </ItemGroup>
`);
        }

        return result;
    }

    private relativePathToWindowsPath(relativePath: RelativeFilePath): string {
        return path.win32.normalize(relativePath);
    }
}
