import { getOpenAPISettings, type OpenAPISpec, type Spec } from "@fern-api/api-workspace-commons";
import { generatorsYml, getLatestGeneratorVersion } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { CliError, TaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import type { SdkConfigV1, SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const SDK_CONFIG_GROUP = "sdk-config";

const GENERATOR_BY_LANGUAGE: Record<string, string> = {
    typescript: "fernapi/fern-typescript-sdk",
    python: "fernapi/fern-python-sdk",
    java: "fernapi/fern-java-sdk",
    kotlin: "fernapi/fern-kotlin-sdk",
    go: "fernapi/fern-go-sdk",
    csharp: "fernapi/fern-csharp-sdk",
    php: "fernapi/fern-php-sdk",
    ruby: "fernapi/fern-ruby-sdk-v2",
    rust: "fernapi/fern-rust-sdk",
    swift: "fernapi/fern-swift-sdk",
    cli: "fernapi/fern-cli-generator",
    mcp: "fernapi/fern-mcp-server"
};

export async function createSdkConfigWorkspace({
    sdkConfig,
    absolutePathToConfig,
    cliVersion,
    context
}: {
    sdkConfig: SdkConfigV1;
    absolutePathToConfig: string;
    cliVersion: string;
    context: TaskContext;
}): Promise<OSSWorkspace> {
    const configDirectory = path.dirname(absolutePathToConfig);
    const specs = await Promise.all(
        sdkConfig.source.specs.map((spec) => createSpec({ spec, sdkConfig, configDirectory, context }))
    );
    const group: generatorsYml.GeneratorGroup = {
        groupName: SDK_CONFIG_GROUP,
        audiences:
            sdkConfig.api.audiences == null
                ? { type: "all" }
                : { type: "select", audiences: sdkConfig.api.audiences },
        generators: await Promise.all(
            sdkConfig.targets.map(async (target) => {
                const name = GENERATOR_BY_LANGUAGE[target.language];
                if (name == null) {
                    return context.failAndThrow(
                        `SDK Config target language '${target.language}' is not supported by the Fern remote generation bridge`,
                        undefined,
                        { code: CliError.Code.ConfigError }
                    );
                }
                const version =
                    target.generatorVersion ??
                    (await getLatestGeneratorVersion({
                        generatorName: name,
                        cliVersion,
                        channel: undefined,
                        includeMajor: true,
                        context
                    }));
                if (version == null) {
                    return context.failAndThrow(
                        `Could not resolve a generator version for SDK Config target '${target.language}'`,
                        undefined,
                        { code: CliError.Code.NetworkError }
                    );
                }
                return createGeneratorInvocation({
                    name,
                    version,
                    language: target.language,
                    output: target.output ?? sdkConfig.output,
                    configDirectory
                });
            })
        ),
        reviewers: undefined
    };
    const generatorsConfiguration: generatorsYml.GeneratorsConfiguration = {
        api: undefined,
        defaultGroup: SDK_CONFIG_GROUP,
        groupAliases: {},
        reviewers: undefined,
        groups: [group],
        whitelabel: undefined,
        ai: undefined,
        replay: undefined,
        rawConfiguration: {} as generatorsYml.GeneratorsConfigurationSchema,
        // This is an in-memory adapter. The path is retained only for diagnostics; it is never parsed as generators.yml.
        absolutePathToConfiguration: AbsoluteFilePath.of(absolutePathToConfig)
    };
    const workspace = new OSSWorkspace({
        allSpecs: specs,
        specs: specs.filter((spec): spec is OpenAPISpec => spec.type === "openapi"),
        generatorsConfiguration,
        workspaceName: undefined,
        cliVersion,
        absoluteFilePath: AbsoluteFilePath.of(configDirectory)
    });
    await workspace.processGraphQLSpecs(context);
    return workspace;
}

function createGeneratorInvocation({
    name,
    version,
    language,
    output,
    configDirectory
}: {
    name: string;
    version: string;
    language: string;
    output: SdkConfigV1["output"];
    configDirectory: string;
}): generatorsYml.GeneratorInvocation {
    return {
        name,
        version,
        config: {},
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        automation: { generate: true, preview: true, upgrade: true, verify: true },
        containerImage: undefined,
        irVersionOverride: undefined,
        absolutePathToLocalOutput:
            output?.delivery === "files"
                ? AbsoluteFilePath.of(path.resolve(configDirectory, output.path ?? `generated/${language}`))
                : undefined,
        absolutePathToLocalSnippets: undefined,
        keywords: undefined,
        smartCasing: false,
        smartCasingDigitWordBoundary: false,
        disableExamples: false,
        language: isLegacyGenerationLanguage(language) ? language : undefined,
        publishMetadata: undefined,
        readme: undefined,
        settings: undefined
    };
}

async function createSpec({
    spec,
    sdkConfig,
    configDirectory,
    context
}: {
    spec: SdkConfigV1SourceSpec;
    sdkConfig: SdkConfigV1;
    configDirectory: string;
    context: TaskContext;
}): Promise<Spec> {
    if ((spec.overlays?.length ?? 0) > 1) {
        return context.failAndThrow(
            `SDK Config source '${spec.id}' declares multiple overlays, which the Fern source loader does not yet support`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const absoluteFilepath = await resolveSourcePath(spec, configDirectory, context);
    const absoluteFilepathToOverrides = spec.overrides?.map((value) => resolveTransformPath(value, configDirectory));
    if (spec.type === "graphql") {
        return {
            type: "graphql",
            absoluteFilepath,
            absoluteFilepathToOverrides,
            absoluteFilepathToExamples: undefined,
            namespace: spec.namespace
        };
    }
    const rootSettings = sdkConfig.source.apiImportSettings ?? {};
    const settings = { ...rootSettings, ...spec.apiImportSettings };
    return {
        type: "openapi",
        absoluteFilepath,
        absoluteFilepathToOverrides,
        absoluteFilepathToOverlays:
            spec.overlays?.[0] == null ? undefined : resolveTransformPath(spec.overlays[0], configDirectory),
        namespace: spec.namespace,
        settings: getOpenAPISettings({
            overrides: {
                ...settings,
                useTitlesAsName: settings.titleAsSchemaName,
                shouldUseIdiomaticRequestNames: settings.idiomaticRequestNames
            }
        }),
        source: {
            type: spec.type === "asyncapi" ? "asyncapi" : "openapi",
            file: absoluteFilepath
        }
    };
}

async function resolveSourcePath(
    spec: SdkConfigV1SourceSpec,
    configDirectory: string,
    context: TaskContext
): Promise<AbsoluteFilePath> {
    if ("path" in spec) {
        return AbsoluteFilePath.of(path.resolve(configDirectory, spec.path));
    }
    const response = await fetch(spec.url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
        return context.failAndThrow(
            `Could not download SDK Config source '${spec.id}' from ${spec.url}: ${response.status} ${response.statusText}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
    }
    const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-source-"));
    const absolutePath = path.join(directory, `${sanitizeFilename(spec.id)}.json`);
    await writeFile(absolutePath, Buffer.from(await response.arrayBuffer()));
    return AbsoluteFilePath.of(absolutePath);
}

function resolveTransformPath(value: string, configDirectory: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(path.resolve(configDirectory, value));
}

function sanitizeFilename(value: string): string {
    return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isLegacyGenerationLanguage(language: string): language is generatorsYml.GenerationLanguage {
    return Object.values(generatorsYml.GenerationLanguage).some((candidate) => candidate === language);
}
