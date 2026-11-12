import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
    getOpenAPISettings,
    type OpenAPISettings,
    type OpenAPISpec,
    type ProtobufSpec,
    type Spec
} from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { bundleRemoteOpenAPI, OSSWorkspace, WorkspaceLoaderFailureType } from "@fern-api/lazy-fern-workspace";
import { getOnPremAdapterForLanguage, isOnPremAdapter } from "@fern-api/local-workspace-runner";
import { resolveSdkConfigGeneratorVersion } from "@fern-api/remote-workspace-runner";
import { CliError, TaskContext } from "@fern-api/task-context";
import { loadSingleNamespaceAPIWorkspace, resolveRemoteSpecs } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import type { SdkConfigV1, SdkConfigV1McpOutputConfig, SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";

import { getDuplicateTargetLanguageIndexes } from "./getDuplicateTargetLanguageIndexes.js";
import { getSdkConfigGeneratorName } from "./sdkConfigGeneratorName.js";
import { isProtobufSource, type SdkConfigV1ProtobufSourceSpec } from "./sdkConfigProtobufSources.js";

const SDK_CONFIG_GROUP = "sdk-config";
const DEFAULT_LOCAL_OUTPUT_DIRECTORY = "generated";

export interface CreatedSdkConfigWorkspace {
    workspace: OSSWorkspace;
    cleanup: () => Promise<void>;
}

export async function createSdkConfigWorkspace({
    sdkConfig,
    absolutePathToConfig,
    sourceRoot,
    cliVersion,
    workspaceName,
    local = false,
    context
}: {
    sdkConfig: SdkConfigV1;
    absolutePathToConfig: string;
    sourceRoot?: string;
    cliVersion: string;
    workspaceName?: string;
    /** Run targets with local Docker, on the on-prem adapter, instead of through sdk-gen-api. */
    local?: boolean;
    context: TaskContext;
}): Promise<CreatedSdkConfigWorkspace> {
    const configDirectory = path.dirname(absolutePathToConfig);
    const sourceDirectory = path.resolve(sourceRoot ?? configDirectory);
    const temporaryDirectories: string[] = [];
    const cleanup = async () => {
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    };
    try {
        const specs: Spec[] = [];
        for (const spec of sdkConfig.source.specs) {
            specs.push(
                isProtobufSource(spec)
                    ? await createProtobufSpec({ spec, sdkConfig, sourceDirectory, context })
                    : await createSpec({ spec, sdkConfig, sourceDirectory, context, temporaryDirectories })
            );
        }
        const duplicateTargetLanguageIndexes = getDuplicateTargetLanguageIndexes(sdkConfig.targets);
        // ponytail: the local runner picks a target by language, so a repeated language would run the
        // first target's settings twice. Thread the target index into resolveSdkConfigIr to lift this.
        const duplicateIndex = duplicateTargetLanguageIndexes.findIndex((index) => index != null);
        if (local && duplicateIndex !== -1) {
            return context.failAndThrow(
                `--local runs one SDK Config target per language, but more than one '${sdkConfig.targets[duplicateIndex]?.language}' target is selected. Select a single target, or remove --local.`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
        const group: generatorsYml.GeneratorGroup = {
            groupName: SDK_CONFIG_GROUP,
            audiences:
                sdkConfig.api.audiences == null
                    ? { type: "all" }
                    : { type: "select", audiences: sdkConfig.api.audiences },
            generators: sdkConfig.targets.map((target, targetIndex) => {
                const { name, version } = local
                    ? resolveLocalGenerator(target, context)
                    : resolveRemoteGenerator(target, context);
                return createGeneratorInvocation({
                    name,
                    version,
                    language: target.language,
                    output: target.output ?? sdkConfig.output,
                    configDirectory,
                    local,
                    sdkConfigTargetIndex: targetIndex,
                    duplicateTargetLanguageIndex: duplicateTargetLanguageIndexes[targetIndex]
                });
            }),
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
            // Same split as loadAPIWorkspace: a from-openapi protobuf source is converted to OpenAPI and
            // generated from `specs`; any other protobuf source stays in `allSpecs`.
            allSpecs: specs.filter((spec) => !isFromOpenAPIProtobufSpec(spec)),
            specs: specs.filter(
                (spec): spec is OpenAPISpec | ProtobufSpec => spec.type === "openapi" || isFromOpenAPIProtobufSpec(spec)
            ),
            generatorsConfiguration,
            workspaceName,
            cliVersion,
            absoluteFilePath: AbsoluteFilePath.of(configDirectory)
        });
        await workspace.processGraphQLSpecs(context);
        return { workspace, cleanup };
    } catch (error) {
        await cleanup();
        throw error;
    }
}

type SdkConfigTarget = SdkConfigV1["targets"][number];
type SdkConfigV1PathOrUrlSourceSpec = Exclude<SdkConfigV1SourceSpec, SdkConfigV1ProtobufSourceSpec>;

function resolveRemoteGenerator(target: SdkConfigTarget, context: TaskContext): { name: string; version: string } {
    const name = getSdkConfigGeneratorName(target.language);
    if (name == null) {
        return context.failAndThrow(
            `SDK Config target language '${target.language}' is not supported by the Fern remote generation bridge`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return { name, version: resolveSdkConfigGeneratorVersion(target.generatorVersion) };
}

function resolveLocalGenerator(target: SdkConfigTarget, context: TaskContext): { name: string; version: string } {
    const adapter = getOnPremAdapterForLanguage(target.language);
    if (adapter == null) {
        return context.failAndThrow(
            `SDK Config target '${target.language}' cannot run with --local because no local generator exists for it. Remove --local to generate it remotely.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    // ponytail: an unpinned target runs the adapter's cutover release locally, where the remote route
    // resolves the newest one. Resolve the newest published tag here if that gap starts to matter.
    const version = target.generatorVersion ?? adapter.cutover;
    if (!isOnPremAdapter(adapter.name, version)) {
        return context.failAndThrow(
            `SDK Config target '${target.language}' pins generatorVersion ${version}, but SDK Config support starts at ${adapter.cutover}. Use ${adapter.cutover} or later.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return { name: adapter.name, version };
}

function createGeneratorInvocation({
    name,
    version,
    language,
    output,
    configDirectory,
    local,
    sdkConfigTargetIndex,
    duplicateTargetLanguageIndex
}: {
    name: string;
    version: string;
    language: string;
    output: SdkConfigV1["output"] | SdkConfigV1McpOutputConfig;
    configDirectory: string;
    local: boolean;
    sdkConfigTargetIndex: number;
    duplicateTargetLanguageIndex: number | undefined;
}): generatorsYml.GeneratorInvocation {
    const filesPath = output?.delivery === "files" ? output.path : undefined;
    return {
        name,
        sdkConfigTargetIndex,
        version,
        config: {},
        outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
        automation: { generate: true, preview: true, upgrade: true, verify: true },
        containerImage: undefined,
        irVersionOverride: undefined,
        // SDK Config permits files delivery without a path. Keep those outputs separated by
        // language under a stable directory next to sdk-config.yml. A local run always generates into
        // a directory, whatever delivery the target asks for; the adapter warns about the substitution.
        absolutePathToLocalOutput:
            output?.delivery === "files" || local
                ? AbsoluteFilePath.of(
                      path.resolve(
                          configDirectory,
                          filesPath ??
                              `${DEFAULT_LOCAL_OUTPUT_DIRECTORY}/${language}${duplicateTargetLanguageIndex == null ? "" : `-${duplicateTargetLanguageIndex}`}`
                      )
                  )
                : undefined,
        // A hosted MCP target has no output path: generation lands in a managed temporary directory and
        // the generated bundle is deployed from there (see fernHostedOutputs.ts). It never combines with
        // `--local`: the MCP language has no local (on-prem) generator, so `resolveLocalGenerator` rejects
        // the target before this invocation is built.
        ...(output?.delivery === "hosted" ? { fernHostedOutput: { slug: output.slug } } : {}),
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
    sourceDirectory,
    context,
    temporaryDirectories
}: {
    spec: SdkConfigV1PathOrUrlSourceSpec;
    sdkConfig: SdkConfigV1;
    sourceDirectory: string;
    context: TaskContext;
    temporaryDirectories: string[];
}): Promise<Spec> {
    if ((spec.overlays?.length ?? 0) > 1) {
        return context.failAndThrow(
            `SDK Config source '${spec.id}' declares multiple overlays, which the Fern source loader does not yet support`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const absoluteFilepath = await resolveSourcePath(spec, sourceDirectory, context, temporaryDirectories);
    const absoluteFilepathToOverrides = spec.overrides?.map((value) => resolveTransformPath(value, sourceDirectory));
    if (spec.type === "graphql") {
        return {
            type: "graphql",
            absoluteFilepath,
            absoluteFilepathToOverrides,
            absoluteFilepathToExamples: undefined,
            namespace: spec.namespace
        };
    }
    return {
        type: "openapi",
        absoluteFilepath,
        absoluteFilepathToOverrides,
        absoluteFilepathToOverlays:
            spec.overlays?.[0] == null ? undefined : resolveTransformPath(spec.overlays[0], sourceDirectory),
        namespace: spec.namespace,
        settings: getImportSettings(sdkConfig, spec),
        source: {
            type: spec.type === "asyncapi" ? "asyncapi" : "openapi",
            file: absoluteFilepath
        }
    };
}

/**
 * Loads a protobuf source the way generators.yml loads a `proto:` spec: git roots are cloned by
 * resolveRemoteSpecs (a git target is relative to the repository root), and local root, target and
 * overrides resolve against the source directory.
 */
async function createProtobufSpec({
    spec,
    sdkConfig,
    sourceDirectory,
    context
}: {
    spec: SdkConfigV1ProtobufSourceSpec;
    sdkConfig: SdkConfigV1;
    sourceDirectory: string;
    context: TaskContext;
}): Promise<ProtobufSpec> {
    if (spec.namespace != null) {
        context.logger.warn(
            `SDK Config protobuf source '${spec.id}' sets namespace '${spec.namespace}', which the Fern CLI does not apply to protobuf sources. It is ignored.`
        );
    }
    const { root } = spec.proto;
    const definition: generatorsYml.APIDefinitionLocation = {
        schema: {
            type: "protobuf",
            root: typeof root === "string" ? root : root.git.path,
            target: spec.proto.target ?? "",
            localGeneration: spec.proto.localGeneration ?? false,
            fromOpenAPI: spec.proto.fromOpenApi,
            dependencies: spec.proto.dependencies ?? []
        },
        origin: undefined,
        overrides: spec.proto.overrides,
        overlays: undefined,
        audiences: [],
        settings: undefined,
        gitSource:
            typeof root === "string" ? undefined : { repo: root.git.repo, ref: root.git.ref, path: root.git.path }
    };
    let definitions: generatorsYml.APIDefinitionLocation[];
    try {
        definitions = await resolveRemoteSpecs({ definitions: [definition], context });
    } catch (error) {
        return context.failAndThrow(
            `Could not resolve the git root of SDK Config protobuf source '${spec.id}'`,
            error,
            { code: CliError.Code.ConfigError }
        );
    }
    const result = await loadSingleNamespaceAPIWorkspace({
        absolutePathToWorkspace: AbsoluteFilePath.of(sourceDirectory),
        namespace: undefined,
        definitions
    });
    if (!Array.isArray(result)) {
        const problems = result.didSucceed
            ? []
            : Object.entries(result.failures).map(([filepath, failure]) =>
                  failure.type === WorkspaceLoaderFailureType.FILE_MISSING
                      ? `${filepath} does not exist`
                      : `${filepath} could not be loaded`
              );
        return context.failAndThrow(
            `SDK Config protobuf source '${spec.id}' could not be loaded: ${problems.join(", ")}`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const [loaded] = result;
    if (loaded?.type !== "protobuf") {
        throw new Error(`Expected SDK Config protobuf source '${spec.id}' to load as one protobuf spec`);
    }
    return { ...loaded, settings: getImportSettings(sdkConfig, spec) };
}

function getImportSettings(sdkConfig: SdkConfigV1, spec: SdkConfigV1SourceSpec): OpenAPISettings {
    const settings = { ...sdkConfig.source.apiImportSettings, ...spec.apiImportSettings };
    return getOpenAPISettings({
        overrides: {
            ...settings,
            useTitlesAsName: settings.titleAsSchemaName,
            shouldUseIdiomaticRequestNames: settings.idiomaticRequestNames,
            shouldUseUndiscriminatedUnionsWithLiterals: settings.undiscriminatedUnionsWithLiterals,
            asyncApiNaming: settings.asyncApiMessageNaming
        }
    });
}

function isFromOpenAPIProtobufSpec(spec: Spec): spec is ProtobufSpec {
    return spec.type === "protobuf" && spec.fromOpenAPI;
}

async function resolveSourcePath(
    spec: SdkConfigV1PathOrUrlSourceSpec,
    sourceDirectory: string,
    context: TaskContext,
    temporaryDirectories: string[]
): Promise<AbsoluteFilePath> {
    if ("path" in spec) {
        return AbsoluteFilePath.of(path.resolve(sourceDirectory, spec.path));
    }
    if (spec.type !== "openapi") {
        return context.failAndThrow(
            `SDK Config ${spec.type} URL source '${spec.id}' is not supported by the Fern CLI yet. Download ${spec.url} into your project and use a path source instead.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    let bundled: unknown;
    try {
        bundled = await bundleRemoteOpenAPI(spec.url);
    } catch (error) {
        return context.failAndThrow(
            `Could not resolve SDK Config OpenAPI source '${spec.id}' from ${spec.url}`,
            error,
            {
                code: CliError.Code.NetworkError
            }
        );
    }
    const directory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-source-"));
    temporaryDirectories.push(directory);
    const absolutePath = path.join(directory, `${sanitizeFilename(spec.id)}.json`);
    await writeFile(absolutePath, `${JSON.stringify(bundled)}\n`);
    return AbsoluteFilePath.of(absolutePath);
}

function resolveTransformPath(value: string, sourceDirectory: string): AbsoluteFilePath {
    return AbsoluteFilePath.of(path.resolve(sourceDirectory, value));
}

function sanitizeFilename(value: string): string {
    return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isLegacyGenerationLanguage(language: string): language is generatorsYml.GenerationLanguage {
    return Object.values(generatorsYml.GenerationLanguage).some((candidate) => candidate === language);
}
