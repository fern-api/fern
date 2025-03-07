import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { Style } from "@fern-api/browser-compatible-base-generator";
import { Config, DynamicSnippetsGenerator } from "@fern-api/csharp-dynamic-snippets";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";

const PROJECT_FILE_CONTENT = `
<Project Sdk="Microsoft.NET.Sdk">

    <PropertyGroup>
        <TargetFramework>net8.0</TargetFramework>
        <LangVersion>12</LangVersion>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
        <IsPackable>false</IsPackable>
        <IsTestProject>true</IsTestProject>
        <PolySharpIncludeRuntimeSupportedAttributes>true</PolySharpIncludeRuntimeSupportedAttributes>
    </PropertyGroup>

    <ItemGroup>
        <PackageReference Include="PolySharp" Version="1.15.0">
            <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
            <PrivateAssets>all</PrivateAssets>
        </PackageReference>
        <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.13.0"/>
        <PackageReference Include="NUnit" Version="4.3.2"/>
        <PackageReference Include="NUnit.Analyzers" Version="4.6.0">
            <PrivateAssets>all</PrivateAssets>
            <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
        </PackageReference>
        <PackageReference Include="coverlet.collector" Version="6.0.4">
            <PrivateAssets>all</PrivateAssets>
            <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
        </PackageReference>
    </ItemGroup>

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
                const response = await this.dynamicSnippetsGenerator.generate(
                    convertDynamicEndpointSnippetRequest(request),
                    {
                        config: {
                            fullStyleClassName: `Example${idx}`
                        } as Config,
                        style: Style.Full
                    }
                );
                const dynamicSnippetFilePath = this.getTestFilePath({ absolutePathToOutputDir, idx });
                await mkdir(path.dirname(dynamicSnippetFilePath), { recursive: true });
                await writeFile(dynamicSnippetFilePath, response.snippet);
            } catch (error) {
                this.context.logger.error(
                    `Failed to generate dynamic snippet for endpoint ${JSON.stringify(request.endpoint)}: ${error}`
                );
            }
        }
        this.context.logger.debug("Done generating dynamic snippet tests");
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
