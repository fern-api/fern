import { Style } from "@fern-api/browser-compatible-base-generator";
import { deriveRootNamespace, resolveDiagnosticPrefix } from "@fern-api/csharp-codegen";
import { Config, DynamicSnippetsGenerator } from "@fern-api/csharp-dynamic-snippets";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { DynamicSnippetsTestRequest } from "../DynamicSnippetsTestSuite.js";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest.js";
import { convertIr } from "../utils/convertIr.js";

function buildProjectFileContent({ availabilityDiagnosticIds }: { availabilityDiagnosticIds: string }): string {
    const noWarnLine = availabilityDiagnosticIds ? `\n    <NoWarn>$(NoWarn);${availabilityDiagnosticIds}</NoWarn>` : "";
    return `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <RootNamespace>Snippets</RootNamespace>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>${noWarnLine}
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\**\\*.csproj" Exclude="..\\**\\*.Test.csproj;..\\Snippets\\*.csproj" />
  </ItemGroup>
</Project>`;
}

export class DynamicSnippetsCsharpTestGenerator {
    private dynamicSnippetsGenerator: DynamicSnippetsGenerator;

    constructor(
        private readonly context: TaskContext,
        private readonly ir: dynamic.DynamicIntermediateRepresentation,
        private readonly generatorConfig: FernGeneratorExec.GeneratorConfig
    ) {
        // Note: the local-workspace-runner uses convertIr which always returns a DynamicIntermediateRepresentation
        //       that is actually of the latest version in the workspace.
        //       (regardless of version that the dynamic IR is being asked for in the language-specific generator)
        //       This appears to have been always an additive change, so this hasn't broken anything
        //       In v61 we're adding support for more types for the response, which is a mutation of the interface.
        //       This really shouldn't break the language-specific dynamic code generator, because there was never
        //       a need to check the `type` of the response.
        //       In order to not force a version bump of the language-specific dynamic code generator,
        //       we're casting the IR to `as unknown as any` until the individual generators have updated
        //
        //       This doesn't really fix the underlying problem, where the local-workspace-runner is providing
        //       the latest IR to the language-specific dynamic code generator regardless.
        this.dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            // biome-ignore lint/suspicious/noExplicitAny: workaround for version incompatibility - see note above
            ir: convertIr(this.ir) as unknown as any,
            config: this.generatorConfig
        });
    }

    public async generateTests({
        outputDir,
        requests
    }: {
        outputDir: AbsoluteFilePath;
        requests: DynamicSnippetsTestRequest[];
    }): Promise<void> {
        this.context.logger.debug("Generating dynamic snippet tests...");

        // generate the names for everything up front.
        this.dynamicSnippetsGenerator.context.precalculate(requests.map((r) => r.request));
        const absolutePathToOutputDir = await this.initializeProject(outputDir);
        for (const [idx, { endpointId, request }] of requests.entries()) {
            try {
                const convertedRequest = convertDynamicEndpointSnippetRequest(request);
                if (convertedRequest == null) {
                    continue;
                }
                const response = await this.dynamicSnippetsGenerator.generate(convertedRequest, {
                    config: {
                        fullStyleMethodName: `Example${idx}`
                    } as Config,
                    style: Style.Full,
                    endpointId
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

        this.context.logger.debug("Done generating dynamic snippet tests");
    }

    private async initializeProject(outputDir: AbsoluteFilePath): Promise<AbsoluteFilePath> {
        const absolutePathToOutputDir = join(outputDir, RelativeFilePath.of("Snippets"));
        await mkdir(absolutePathToOutputDir, { recursive: true });
        await writeFile(
            join(absolutePathToOutputDir, RelativeFilePath.of("Snippets.csproj")),
            buildProjectFileContent({ availabilityDiagnosticIds: this.getAvailabilityDiagnosticIds() })
        );

        return absolutePathToOutputDir;
    }

    /**
     * Mirrors {@link CsharpProject.getAvailabilityDiagnosticIds}: when availability
     * annotations are enabled, returns the semicolon-delimited list of `[Experimental]`
     * diagnostic IDs to suppress in the snippet project. Otherwise returns an empty
     * string so `Snippets.csproj` output is unchanged (flag-off parity).
     */
    private getAvailabilityDiagnosticIds(): string {
        const customConfig = this.generatorConfig.customConfig as Record<string, unknown> | undefined;
        if (customConfig?.generateAvailabilityAnnotations !== true) {
            return "";
        }
        const overrideRaw = customConfig.availabilityDiagnosticPrefix;
        const override = typeof overrideRaw === "string" ? overrideRaw : undefined;
        const explicitNamespaceRaw = customConfig.namespace;
        const explicitNamespace = typeof explicitNamespaceRaw === "string" ? explicitNamespaceRaw : undefined;
        const rootNamespace = deriveRootNamespace({
            explicitNamespace,
            organization: this.generatorConfig.organization ?? "",
            workspaceName: this.generatorConfig.workspaceName ?? ""
        });
        const prefix = resolveDiagnosticPrefix({ override, rootNamespace });
        return `${prefix}0001;${prefix}0002`;
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
