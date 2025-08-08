import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

import { Style } from "@fern-api/browser-compatible-base-generator";
import { Config, DynamicSnippetsGenerator } from "@fern-api/csharp-dynamic-snippets";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { loggingExeca } from "@fern-api/logging-execa";

const PROJECT_FILE_CONTENT = `
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <TargetFramework>net8.0</TargetFramework>
        <LangVersion>12</LangVersion>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
    </PropertyGroup>

    <ItemGroup>
        <ProjectReference Include="..\\*\\*.csproj" Exclude="..\\*\\*.DynamicSnippets.csproj;..\\*\\*.Test.csproj" />
    </ItemGroup>
</Project>`;

export class DynamicSnippetsCsharpTestGenerator {
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor(
        private readonly context: TaskContext,
        private readonly ir: dynamic.DynamicIntermediateRepresentation,
        private readonly generatorConfig: FernGeneratorExec.GeneratorConfig
    ) {
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(this.ir),
            config: this.generatorConfig
        });
    }

    public async generateTests({
        outputDir,
        requests
    }: {
        outputDir: AbsoluteFilePath;
        requests: dynamic.EndpointSnippetRequest[];
    }): Promise<void> {
        this.context.logger.debug("Generating dynamic snippet tests...");
        const absolutePathToOutputDir = await this.initializeProject(outputDir);
        for (const [idx, request] of requests.entries()) {
            try {
                const convertedRequest = convertDynamicEndpointSnippetRequest(request);
                if (convertedRequest == null) {
                    continue;
                }
                const response = await this.dynamicSnippetsGenerator.generate(convertedRequest, {
                    config: {
                        fullStyleClassName: `Example${idx}`
                    } as Config,
                    style: Style.Full
                });
                const dynamicSnippetFilePath = this.getTestFilePath({ absolutePathToOutputDir, idx });
                await mkdir(path.dirname(dynamicSnippetFilePath), { recursive: true });
                await writeFile(dynamicSnippetFilePath, response.snippet);
            } catch (error) {
                this.context.logger.error(
                    `Failed to generate dynamic snippet for endpoint ${JSON.stringify(request.endpoint)}: ${error}`
                );
            }
        }

        await this.dotnetFormat(
            absolutePathToOutputDir,
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
        await this.dotnetFormat(
            absolutePathToOutputDir,
            `[*.cs]
dotnet_diagnostic.IDE0005.severity = error          
          `
        );

        this.context.logger.debug("Done generating dynamic snippet tests");
    }

    private async dotnetFormat(absolutePathToSrcDirectory: AbsoluteFilePath, editorConfig: string): Promise<void> {
        // write a temporary '.editorconfig' file to the absolutePathToSrcDirectory
        // so we can use dotnet format to pre-format the project (ie, optimize namespace usage, scoping, etc)
        const editorConfigPath = join(absolutePathToSrcDirectory, RelativeFilePath.of(".editorconfig"));
        await writeFile(editorConfigPath, editorConfig);

        // patch the csproj file to only target net8.0 (dotnet format gets weird with multiple target frameworks)
        const csprojPath = join(absolutePathToSrcDirectory, RelativeFilePath.of(`SeedApi.DynamicSnippets.csproj`));
        const csprojContents = (await readFile(csprojPath)).toString();

        // write modified csproj file
        await writeFile(
            csprojPath,
            csprojContents
                .replace(
                    /<TargetFrameworks>.*<\/TargetFrameworks>/,
                    `<TargetFrameworks>netstandard2.0</TargetFrameworks>`
                )
                .replace(/<ImplicitUsings>enable<\/ImplicitUsings>/, `<ImplicitUsings>disable</ImplicitUsings>`)
                .replace(/<LangVersion>12<\/LangVersion>/, `<LangVersion>11</LangVersion>`)
                .replace(
                    /<\/Project>/,
                    `    <ItemGroup>
      <Using Include="System" />
  </ItemGroup>
</Project>`
                )
        );

        // call dotnet format
        await loggingExeca(
            this.context.logger,
            "dotnet",
            ["format", "--verbosity", "detailed", "--severity", "error"],
            {
                doNotPipeOutput: true,
                cwd: absolutePathToSrcDirectory
            }
        );

        await writeFile(csprojPath, csprojContents);
        // remove the temporary editorconfig file
        await unlink(editorConfigPath);

        await writeFile(csprojPath, csprojContents);
    }

    private async initializeProject(outputDir: AbsoluteFilePath): Promise<AbsoluteFilePath> {
        const absolutePathToOutputDir = join(outputDir, RelativeFilePath.of("src/SeedApi.DynamicSnippets"));
        await mkdir(absolutePathToOutputDir, { recursive: true });
        await writeFile(
            join(absolutePathToOutputDir, RelativeFilePath.of("SeedApi.DynamicSnippets.csproj")),
            PROJECT_FILE_CONTENT
        );
        return absolutePathToOutputDir;
    }

    private getTestFilePath({
        absolutePathToOutputDir,
        idx
    }: {
        absolutePathToOutputDir: AbsoluteFilePath;
        idx: number;
    }): AbsoluteFilePath {
        return join(absolutePathToOutputDir, RelativeFilePath.of(`Example${idx}.cs`));
    }
}
