import {
    type AbstractAPIWorkspace,
    type FernDefinition,
    type FernWorkspace,
    getOpenAPISettings,
    type IdentifiableSource,
    type ProtobufSpec,
    type Spec
} from "@fern-api/api-workspace-commons";
import { docsYml, generatorsYml } from "@fern-api/configuration-loader";
import { toPosixPath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import type {
    SdkConfigV1GitRemote,
    SdkConfigV1ProtobufSource,
    SdkConfigV1SourceConfig,
    SdkConfigV1SourceSpec
} from "@postman/sdk-config/sdk-config/v1";
import path from "path";

const DEFAULT_PATH_PARAMETER_STYLE = getOpenAPISettings().inlinePathParameters ? "inline" : "wrapped";
const DOCS_IMPORT_SETTING_KEY_PAIRS = [
    ["typeDatesAsStrings", "type-dates-as-strings"],
    ["useBytesForBinaryResponse", "use-bytes-for-binary-response"],
    ["respectParameterContent", "respect-parameter-content"],
    ["respectOperationIdWordBoundaries", "respect-operation-id-word-boundaries"],
    ["inferForwardCompatible", "infer-forward-compatible"],
    ["preserveOneOfInAllOf", "preserve-one-of-in-all-of"],
    ["anyOfSiblingPropertiesAsObject", "any-of-sibling-properties-as-object"],
    ["errorResponses", "error-responses"]
] as const satisfies ReadonlyArray<
    readonly [keyof generatorsYml.APIDefinitionSettings, keyof generatorsYml.OpenApiSettingsSchema]
>;
const DOCS_IMPORT_SETTING_KEYS = new Set(DOCS_IMPORT_SETTING_KEY_PAIRS.map(([key]) => key));
const RAW_DOCS_IMPORT_SETTING_KEYS = new Set(DOCS_IMPORT_SETTING_KEY_PAIRS.map(([, key]) => key));

export type ResolvedMigrationSourceSpec = ResolvedMigrationFileSpec | ResolvedMigrationProtobufSpec;

export interface ResolvedMigrationFileSpec {
    absolutePath: string;
    absoluteOverlayPaths: string[];
    absoluteOverridePaths: string[];
    apiImportSettings?: SdkConfigV1SourceSpec["apiImportSettings"];
    clientPathParameterStyle?: "inline" | "wrapped";
    clientPathParameterStyleExplicit?: boolean;
    docsImportSettings?: docsYml.RawSchemas.ApiSpecImportSettings;
    hasLegacyOnlyDocsImportSettings?: boolean;
    idHint?: string;
    name?: string;
    namespace?: string;
    type: Exclude<SdkConfigV1SourceSpec, { proto: unknown }>["type"];
}

export function isResolvedMigrationFileSpec(spec: ResolvedMigrationSourceSpec): spec is ResolvedMigrationFileSpec {
    return spec.type !== "protobuf";
}

export interface ResolvedMigrationProtobufSpec {
    absoluteOverridePaths: string[];
    apiImportSettings?: SdkConfigV1SourceSpec["apiImportSettings"];
    dependencies: string[];
    fromOpenApi: boolean;
    idHint: string;
    localGeneration: boolean;
    location: ResolvedProtobufLocation;
    type: "protobuf";
}

/** A local root keeps absolute paths. A git root keeps its remote, and its target stays relative to the repository root. */
export type ResolvedProtobufLocation =
    | { type: "local"; absoluteRootPath: string; absoluteTargetPath: string | undefined }
    | { type: "git"; remote: SdkConfigV1GitRemote; target: string | undefined };

export interface SourceDerivedApiFields {
    auth: boolean;
    environments: boolean;
    headerNames: string[];
}

export function identifySourceDerivedApiFields({
    workspace,
    groups,
    definition
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    groups: generatorsYml.GeneratorGroup[];
    definition: FernDefinition;
}): SourceDerivedApiFields {
    if (workspace.type !== "oss") {
        return { auth: false, environments: false, headerNames: [] };
    }

    const api = workspace.generatorsConfiguration?.api;
    const hasConfiguredAuth =
        api?.auth != null ||
        api?.["auth-schemes"] != null ||
        groups.some((group) =>
            group.generators.some(
                (generator) => generator.apiOverride?.auth != null || generator.apiOverride?.["auth-schemes"] != null
            )
        );
    const hasConfiguredEnvironments = api?.environments != null || api?.["default-environment"] != null;
    const hasConfiguredHeaders =
        api?.headers != null ||
        groups.some((group) => group.generators.some((generator) => generator.apiOverride?.headers != null));
    // OSS conversion always defines this non-enumerable metadata. If it is absent, a clone or spread discarded the
    // provenance, so fail explicitly instead of silently duplicating source-derived headers again.
    const sourceDerivedGlobalHeaderNames = definition.sourceDerivedGlobalHeaderNames;
    if (!hasConfiguredHeaders && sourceDerivedGlobalHeaderNames == null) {
        throw new CliError({
            message:
                "Could not determine global-header provenance for the resolved API definition. Reload the workspace before running fern sdk migrate.",
            code: CliError.Code.InternalError
        });
    }

    return {
        auth: !hasConfiguredAuth,
        environments: !hasConfiguredEnvironments,
        headerNames: hasConfiguredHeaders ? [] : (sourceDerivedGlobalHeaderNames ?? [])
    };
}

/**
 * The specs of the API itself (the top-level `api:` section of generators.yml), ignoring any generator-level
 * override. Returns undefined when the workspace does not list specs of its own.
 */
export function resolveWorkspaceSourceSpecs(
    workspace: AbstractAPIWorkspace<unknown>
): ResolvedMigrationSourceSpec[] | undefined {
    const { specs, needsReordering } = workspaceSpecs(workspace);
    if (specs.length === 0) {
        return undefined;
    }
    const workspacePath = workspace.absoluteFilePath.toString();
    const configuredDefinitions = getConfiguredDefinitions(workspace.generatorsConfiguration?.api);
    const claimedDefinitions = new Set<ConfiguredDefinition>();
    const matched = specs.map((spec) => {
        const configuredDefinition = findConfiguredDefinition(
            workspacePath,
            spec,
            configuredDefinitions,
            claimedDefinitions
        );
        if (configuredDefinition?.location.gitSource != null && spec.type !== "protobuf") {
            throw new CliError({
                message: `fern sdk migrate cannot create durable local paths for git-backed API specification '${configuredDefinition.location.gitSource.path}' from '${configuredDefinition.location.gitSource.repo}'. Move the specification into the project or migrate this configuration manually.`,
                code: CliError.Code.ConfigError
            });
        }
        return { spec, configuredDefinition };
    });
    return (needsReordering ? inConfiguredOrder(matched, configuredDefinitions) : matched).map(
        ({ spec, configuredDefinition }) =>
            spec.type === "protobuf"
                ? resolveWorkspaceProtobufSpec(spec, configuredDefinition?.location)
                : resolveWorkspaceSpec(spec, configuredDefinition?.location.settings)
    );
}

/**
 * The workspace loader splits the configured specs into two views: `allSpecs` leaves out protos generated from
 * OpenAPI, `specs` leaves out the other protos. Together they hold every spec the API lists. `allSpecs` keeps
 * generators.yml order, so only specs missing from it need reordering.
 */
function workspaceSpecs(workspace: AbstractAPIWorkspace<unknown>): { specs: Spec[]; needsReordering: boolean } {
    const allSpecs = specArray(workspace, "allSpecs");
    const seen = new Set<Spec>(allSpecs);
    const missing = specArray(workspace, "specs").filter((spec) => !seen.has(spec));
    return { specs: [...allSpecs, ...missing], needsReordering: missing.length > 0 };
}

function specArray(workspace: AbstractAPIWorkspace<unknown>, key: "allSpecs" | "specs"): Spec[] {
    if (!(key in workspace)) {
        return [];
    }
    const value: unknown = (workspace as unknown as Record<typeof key, unknown>)[key];
    return Array.isArray(value) ? (value as Spec[]) : [];
}

/**
 * Restores generators.yml order, which the two workspace views lose. When a spec cannot be matched to its
 * configured definition, the loaded order is kept instead.
 */
function inConfiguredOrder<T extends { configuredDefinition: ConfiguredDefinition | undefined }>(
    matched: T[],
    configuredDefinitions: ConfiguredDefinition[]
): T[] {
    const indexed = matched.map((entry) => ({
        entry,
        index: entry.configuredDefinition == null ? -1 : configuredDefinitions.indexOf(entry.configuredDefinition)
    }));
    if (indexed.some(({ index }) => index === -1)) {
        return matched;
    }
    return indexed.sort((left, right) => left.index - right.index).map(({ entry }) => entry);
}

export function resolveMigrationSourceSpecs({
    workspace,
    fernWorkspace,
    generator
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    fernWorkspace: FernWorkspace;
    generator: generatorsYml.GeneratorInvocation;
}): ResolvedMigrationSourceSpec[] {
    if (generator.apiOverride?.specs != null) {
        return resolveGeneratorSpecOverrides(workspace.absoluteFilePath, generator.apiOverride.specs);
    }
    const workspaceSpecs = resolveWorkspaceSourceSpecs(workspace);
    if (workspaceSpecs != null) {
        return workspaceSpecs;
    }
    if (fernWorkspace.sources.length > 0) {
        return fernWorkspace.sources.map(resolveIdentifiableSource);
    }
    throw new CliError({
        message:
            "SDK Config v1 requires at least one OpenAPI, AsyncAPI, or GraphQL source. This Fern API does not expose a supported source specification.",
        code: CliError.Code.ConfigError
    });
}

export function serializeMigrationSource({
    specs,
    workingDirectory
}: {
    specs: ResolvedMigrationSourceSpec[];
    workingDirectory: string;
}): SdkConfigV1SourceConfig {
    const sourceRoot = migrationSourceRoot(workingDirectory, specs);
    const usedIds = new Set<string>();
    const serializedSpecs = specs.map((spec): SdkConfigV1SourceSpec => {
        if (spec.type === "protobuf") {
            return serializeProtobufSpec(spec, uniqueSourceId(spec.idHint, usedIds), sourceRoot);
        }
        const id = uniqueSourceId(spec.idHint ?? sourceIdFromPath(spec.absolutePath), usedIds);
        return {
            id,
            type: spec.type,
            path: relativeSourcePath(sourceRoot, spec.absolutePath),
            ...(spec.name == null ? {} : { name: spec.name }),
            ...(spec.namespace == null ? {} : { namespace: spec.namespace }),
            ...(spec.apiImportSettings == null ? {} : { apiImportSettings: spec.apiImportSettings }),
            ...(spec.absoluteOverlayPaths.length === 0
                ? {}
                : {
                      overlays: spec.absoluteOverlayPaths.map((overlay) => relativeSourcePath(sourceRoot, overlay))
                  }),
            ...(spec.absoluteOverridePaths.length === 0
                ? {}
                : {
                      overrides: spec.absoluteOverridePaths.map((override) => relativeSourcePath(sourceRoot, override))
                  })
        };
    });
    return hoistSharedApiImportSettings(serializedSpecs);
}

function serializeProtobufSpec(
    spec: ResolvedMigrationProtobufSpec,
    id: string,
    sourceRoot: string
): SdkConfigV1SourceSpec {
    const { location } = spec;
    const target =
        location.type === "git"
            ? location.target
            : location.absoluteTargetPath == null
              ? undefined
              : relativeSourcePath(sourceRoot, location.absoluteTargetPath);
    const proto: SdkConfigV1ProtobufSource = {
        root:
            location.type === "git"
                ? { git: location.remote }
                : relativeSourcePath(sourceRoot, location.absoluteRootPath),
        ...(target == null ? {} : { target }),
        ...(spec.absoluteOverridePaths.length === 0
            ? {}
            : { overrides: spec.absoluteOverridePaths.map((override) => relativeSourcePath(sourceRoot, override)) }),
        ...(spec.dependencies.length === 0 ? {} : { dependencies: spec.dependencies }),
        ...(spec.localGeneration ? { localGeneration: true } : {}),
        // Written even when false, so a later change of the default does not change migrated configurations.
        fromOpenApi: spec.fromOpenApi
    };
    return {
        id,
        ...(spec.apiImportSettings == null ? {} : { apiImportSettings: spec.apiImportSettings }),
        proto
    };
}

export function resolveMigrationPathParameterStyle(
    specs: ResolvedMigrationSourceSpec[]
): "inline" | "wrapped" | undefined {
    const explicitlyConfiguredSpecs = specs.filter(
        (spec): spec is ResolvedMigrationFileSpec =>
            spec.type === "openapi" && spec.clientPathParameterStyleExplicit === true
    );
    if (explicitlyConfiguredSpecs.length === 0) {
        return undefined;
    }
    const configuredStyles = new Set(
        explicitlyConfiguredSpecs.map((spec) => spec.clientPathParameterStyle ?? DEFAULT_PATH_PARAMETER_STYLE)
    );
    if (configuredStyles.size > 1) {
        const conflictingSpecs = explicitlyConfiguredSpecs
            .map(
                (spec) =>
                    `${spec.idHint ?? spec.namespace ?? spec.name ?? spec.absolutePath}=${spec.clientPathParameterStyle ?? DEFAULT_PATH_PARAMETER_STYLE}`
            )
            .join(", ");
        throw new CliError({
            message: `SDK Config v1 cannot represent conflicting inline-path-parameters settings across API specifications: ${conflictingSpecs}. Align these settings or migrate the configurations separately.`,
            code: CliError.Code.ConfigError
        });
    }
    return configuredStyles.values().next().value;
}

function migrationSourceRoot(workingDirectory: string, specs: ResolvedMigrationSourceSpec[]): string {
    return specs.flatMap(sourceRootPaths).reduce(commonAncestor, path.resolve(workingDirectory));
}

/**
 * fern generate resolves SDK Config paths against a source root it derives from the API's own files
 * (`getAbsoluteFilePaths`), which count a proto's target and overrides but not its root, and skip protos generated
 * from OpenAPI. A proto counts only those same paths here so both commands agree on the root; any other proto path
 * is written relative to it, with `..` when it lies outside.
 */
function sourceRootPaths(spec: ResolvedMigrationSourceSpec): string[] {
    if (spec.type !== "protobuf") {
        return [spec.absolutePath, ...spec.absoluteOverlayPaths, ...spec.absoluteOverridePaths];
    }
    if (spec.fromOpenApi) {
        return [];
    }
    const target = spec.location.type === "local" ? spec.location.absoluteTargetPath : undefined;
    return [...(target == null ? [] : [target]), ...spec.absoluteOverridePaths];
}

function commonAncestor(candidateRoot: string, candidatePath: string): string {
    const resolvedPath = path.resolve(candidatePath);
    let root = candidateRoot;
    while (!isWithin(root, resolvedPath)) {
        const parent = path.dirname(root);
        if (parent === root) {
            throw new CliError({
                message: "SDK Config source files must share a filesystem root with the Fern project.",
                code: CliError.Code.ConfigError
            });
        }
        root = parent;
    }
    return root;
}

function isWithin(root: string, candidate: string): boolean {
    const relative = path.relative(root, candidate);
    return (
        relative === "" || (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`))
    );
}

type ApiImportSettings = NonNullable<SdkConfigV1SourceSpec["apiImportSettings"]>;

function hoistSharedApiImportSettings(specs: SdkConfigV1SourceSpec[]): SdkConfigV1SourceConfig {
    const firstSettings = specs[0]?.apiImportSettings;
    if (firstSettings == null) {
        return { specs };
    }

    const sharedEntries = Object.entries(firstSettings).filter(
        ([key, value]) =>
            value !== undefined &&
            specs.every((spec) => spec.apiImportSettings?.[key as keyof ApiImportSettings] === value)
    );
    if (sharedEntries.length === 0) {
        return { specs };
    }

    const sharedKeys = new Set(sharedEntries.map(([key]) => key));
    return {
        specs: specs.map((spec) => {
            const { apiImportSettings, ...rest } = spec;
            const remainingSettings = Object.fromEntries(
                Object.entries(apiImportSettings ?? {}).filter(([key]) => !sharedKeys.has(key))
            ) as ApiImportSettings;
            return Object.keys(remainingSettings).length === 0
                ? rest
                : { ...rest, apiImportSettings: remainingSettings };
        }),
        apiImportSettings: Object.fromEntries(sharedEntries) as ApiImportSettings
    };
}

function resolveWorkspaceSpec(
    spec: Exclude<Spec, ProtobufSpec>,
    settings: generatorsYml.APIDefinitionSettings | undefined
): ResolvedMigrationFileSpec {
    switch (spec.type) {
        case "openapi":
            if (spec.source.type === "protobuf") {
                // Only OpenAPI converted from a proto at generation time has a protobuf source; the workspace
                // loader never produces one.
                throw new CliError({
                    message: `fern sdk migrate received OpenAPI converted from protobuf root '${spec.source.root}' instead of its proto spec.`,
                    code: CliError.Code.InternalError
                });
            }
            return {
                absolutePath: spec.absoluteFilepath,
                absoluteOverlayPaths: spec.absoluteFilepathToOverlays == null ? [] : [spec.absoluteFilepathToOverlays],
                absoluteOverridePaths: normalizePaths(spec.absoluteFilepathToOverrides),
                apiImportSettings: projectFernApiImportSettings(settings),
                docsImportSettings: projectFernDocsImportSettings(settings, spec.settings?.errorResponses),
                hasLegacyOnlyDocsImportSettings: hasSettingsOutsideDocsAllowlist(settings, DOCS_IMPORT_SETTING_KEYS),
                ...(spec.source.type !== "openapi"
                    ? {}
                    : {
                          clientPathParameterStyle:
                              settings?.inlinePathParameters == null
                                  ? DEFAULT_PATH_PARAMETER_STYLE
                                  : settings.inlinePathParameters
                                    ? "inline"
                                    : "wrapped",
                          clientPathParameterStyleExplicit: settings?.inlinePathParameters != null
                      }),
                idHint: spec.namespace,
                namespace: spec.namespace,
                type: spec.source.type
            };
        case "graphql":
            return {
                absolutePath: spec.absoluteFilepath,
                absoluteOverlayPaths: [],
                absoluteOverridePaths: normalizePaths(spec.absoluteFilepathToOverrides),
                namespace: spec.namespace,
                idHint: spec.namespace,
                type: "graphql"
            };
        case "openrpc":
            throw unsupportedSourceType(spec.type);
    }
}

function resolveWorkspaceProtobufSpec(
    spec: ProtobufSpec,
    location: generatorsYml.APIDefinitionLocation | undefined
): ResolvedMigrationProtobufSpec {
    const gitSource = location?.gitSource;
    const configuredTarget = location?.schema.type === "protobuf" ? location.schema.target : "";
    const protobufLocation: ResolvedProtobufLocation =
        gitSource == null
            ? {
                  type: "local",
                  absoluteRootPath: spec.absoluteFilepathToProtobufRoot,
                  absoluteTargetPath: spec.absoluteFilepathToProtobufTarget
              }
            : {
                  type: "git",
                  remote: gitRemote(gitSource),
                  target: configuredTarget.length === 0 ? undefined : configuredTarget
              };
    return {
        absoluteOverridePaths: normalizePaths(spec.absoluteFilepathToOverrides),
        apiImportSettings: projectFernApiImportSettings(location?.settings),
        dependencies: spec.dependencies,
        fromOpenApi: spec.fromOpenAPI,
        idHint: protobufIdHint(protobufLocation),
        localGeneration: spec.generateLocally,
        location: protobufLocation,
        type: "protobuf"
    };
}

function resolveRawProtobufSpec(
    workspacePath: string,
    proto: generatorsYml.ProtobufDefinitionSchema
): ResolvedMigrationProtobufSpec {
    const target = proto.target == null || proto.target.length === 0 ? undefined : proto.target;
    const location: ResolvedProtobufLocation =
        typeof proto.root === "string"
            ? {
                  type: "local",
                  absoluteRootPath: path.resolve(workspacePath, proto.root),
                  absoluteTargetPath: target == null ? undefined : path.resolve(workspacePath, target)
              }
            : { type: "git", remote: gitRemote(proto.root.git), target };
    return {
        absoluteOverridePaths: normalizeRawPaths(proto.overrides).map((override) =>
            path.resolve(workspacePath, override)
        ),
        dependencies: proto.dependencies ?? [],
        fromOpenApi: proto["from-openapi"] ?? false,
        idHint: protobufIdHint(location),
        localGeneration: proto["local-generation"] ?? false,
        location,
        type: "protobuf"
    };
}

function gitRemote(source: generatorsYml.GitSource): SdkConfigV1GitRemote {
    return { repo: source.repo, ...(source.ref == null ? {} : { ref: source.ref }), path: source.path };
}

function protobufIdHint(location: ResolvedProtobufLocation): string {
    const identifyingPath =
        location.type === "local"
            ? (location.absoluteTargetPath ?? location.absoluteRootPath)
            : (location.target ?? location.remote.path);
    return sourceIdFromPath(identifyingPath);
}

interface ConfiguredDefinition {
    location: generatorsYml.APIDefinitionLocation;
    namespace: string | undefined;
}

function getConfiguredDefinitions(api: generatorsYml.APIDefinition | undefined): ConfiguredDefinition[] {
    if (api == null || api.type === "conjure") {
        return [];
    }
    if (api.type === "singleNamespace") {
        return api.definitions.map((location) => ({ location, namespace: undefined }));
    }
    return [
        ...Object.entries(api.definitions).flatMap(([namespace, definitions]) =>
            definitions.map((location) => ({ location, namespace }))
        ),
        ...(api.rootDefinitions ?? []).map((location) => ({ location, namespace: undefined }))
    ];
}

function findConfiguredDefinition(
    workspacePath: string,
    spec: Spec,
    definitions: ConfiguredDefinition[],
    claimedDefinitions: Set<ConfiguredDefinition>
): ConfiguredDefinition | undefined {
    if (spec.type === "protobuf") {
        // Fern ignores namespaces on protos, and identical proto entries are interchangeable, so each proto takes
        // the most specific matching entry no earlier proto has taken (the first one among equals).
        const match = definitions
            .filter(
                (definition) =>
                    !claimedDefinitions.has(definition) &&
                    protobufDefinitionMatchesSpec(workspacePath, definition.location, spec)
            )
            .reduce<ConfiguredDefinition | undefined>(
                (best, candidate) =>
                    best == null || protobufMatchSpecificity(candidate) > protobufMatchSpecificity(best)
                        ? candidate
                        : best,
                undefined
            );
        if (match != null) {
            claimedDefinitions.add(match);
        }
        return match;
    }
    const matches = definitions.filter(
        (definition) =>
            definition.namespace === spec.namespace &&
            definitionMatchesSpecType(definition.location, spec) &&
            definitionMatchesSpecPath(workspacePath, definition.location, spec)
    );
    return matches.length === 1 ? matches[0] : undefined;
}

function protobufDefinitionMatchesSpec(
    workspacePath: string,
    definition: generatorsYml.APIDefinitionLocation,
    spec: ProtobufSpec
): boolean {
    if (definition.schema.type !== "protobuf") {
        return false;
    }
    const specRoot = path.resolve(spec.absoluteFilepathToProtobufRoot);
    const specTarget =
        spec.absoluteFilepathToProtobufTarget == null ? undefined : path.resolve(spec.absoluteFilepathToProtobufTarget);
    const configuredTarget = definition.schema.target;
    if (definition.gitSource != null) {
        // A git root and its target were resolved inside a temporary clone of the repository.
        return (
            endsWithPath(specRoot, definition.gitSource.path) &&
            (configuredTarget.length === 0
                ? specTarget == null
                : specTarget != null && endsWithPath(specTarget, configuredTarget))
        );
    }
    return (
        path.resolve(workspacePath, definition.schema.root) === specRoot &&
        (configuredTarget.length === 0
            ? specTarget == null
            : path.resolve(workspacePath, configuredTarget) === specTarget)
    );
}

/**
 * A git entry matches the clone paths by suffix, so `proto` also matches a root at `a/proto`. Preferring the longest
 * git path and target keeps such an entry from taking a spec that belongs to a more specific one.
 */
function protobufMatchSpecificity({ location }: ConfiguredDefinition): number {
    if (location.gitSource == null || location.schema.type !== "protobuf") {
        return 0;
    }
    return path.normalize(location.gitSource.path).length + path.normalize(location.schema.target).length;
}

function endsWithPath(absolutePath: string, relativePath: string): boolean {
    const normalized = path.normalize(relativePath).replace(/[\\/]+$/, "");
    return absolutePath === normalized || absolutePath.endsWith(`${path.sep}${normalized}`);
}

function definitionMatchesSpecType(
    definition: generatorsYml.APIDefinitionLocation,
    spec: Exclude<Spec, ProtobufSpec>
): boolean {
    switch (spec.type) {
        case "openapi":
            return definition.schema.type === "oss";
        case "graphql":
            return definition.schema.type === "graphql";
        case "openrpc":
            return definition.schema.type === "openrpc";
    }
}

function definitionMatchesSpecPath(
    workspacePath: string,
    definition: generatorsYml.APIDefinitionLocation,
    spec: Exclude<Spec, ProtobufSpec>
): boolean {
    const specPath = path.normalize(spec.absoluteFilepath.toString());
    const configuredPath = configuredDefinitionPath(definition);
    if (definition.gitSource != null) {
        const gitPath = path.normalize(definition.gitSource.path);
        return specPath === gitPath || specPath.endsWith(`${path.sep}${gitPath}`);
    }
    const absoluteConfiguredPath = path.isAbsolute(configuredPath)
        ? path.normalize(configuredPath)
        : path.resolve(workspacePath, configuredPath);
    return specPath === absoluteConfiguredPath;
}

function configuredDefinitionPath(definition: generatorsYml.APIDefinitionLocation): string {
    return definition.schema.type === "protobuf" ? definition.schema.root : definition.schema.path;
}

function resolveIdentifiableSource(source: IdentifiableSource): ResolvedMigrationSourceSpec {
    if (source.type === "protobuf") {
        throw new CliError({
            message: `fern sdk migrate cannot migrate protobuf source '${source.id}' because this API does not list its own protobuf specs, so their root, target, and generation settings are unknown. List the proto specs in this API's generators.yml or migrate this configuration manually.`,
            code: CliError.Code.ConfigError
        });
    }
    return {
        absolutePath: source.absoluteFilePath,
        absoluteOverlayPaths: [],
        absoluteOverridePaths: normalizePaths(source.absoluteFilePathToOverrides),
        idHint: source.id,
        type: source.type
    };
}

function resolveGeneratorSpecOverrides(
    workspacePath: string,
    specs: generatorsYml.ApiConfigurationV2SpecsSchema
): ResolvedMigrationSourceSpec[] {
    if (!Array.isArray(specs)) {
        throw unsupportedSourceType("conjure");
    }
    return specs.map((spec): ResolvedMigrationSourceSpec => {
        if (generatorsYml.isProtoSpecSchema(spec)) {
            return resolveRawProtobufSpec(workspacePath, spec.proto);
        }
        if (!generatorsYml.isOpenApiSpecSchema(spec) || typeof spec.openapi !== "string") {
            throw unsupportedSourceType("generator API override");
        }
        return {
            absolutePath: path.resolve(workspacePath, spec.openapi),
            absoluteOverlayPaths: spec.overlays == null ? [] : [path.resolve(workspacePath, spec.overlays)],
            absoluteOverridePaths: normalizeRawPaths(spec.overrides).map((override) =>
                path.resolve(workspacePath, override)
            ),
            apiImportSettings: projectRawApiImportSettings(spec.settings),
            docsImportSettings: projectRawDocsImportSettings(spec.settings, workspacePath),
            hasLegacyOnlyDocsImportSettings: hasSettingsOutsideDocsAllowlist(
                spec.settings,
                RAW_DOCS_IMPORT_SETTING_KEYS
            ),
            clientPathParameterStyle:
                spec.settings?.["inline-path-parameters"] == null
                    ? DEFAULT_PATH_PARAMETER_STYLE
                    : spec.settings["inline-path-parameters"]
                      ? "inline"
                      : "wrapped",
            clientPathParameterStyleExplicit: spec.settings?.["inline-path-parameters"] != null,
            idHint: spec.namespace,
            namespace: spec.namespace,
            type: "openapi"
        };
    });
}

function normalizePaths(value: string | string[] | undefined): string[] {
    return value == null ? [] : Array.isArray(value) ? value : [value];
}

function hasSettingsOutsideDocsAllowlist(settings: object | undefined, allowlist: Set<string>): boolean {
    return (
        settings != null &&
        Object.entries(settings).some(
            ([key, value]) =>
                value !== undefined &&
                !allowlist.has(key) &&
                !(
                    key === "removeDiscriminantsFromSchemas" &&
                    value === generatorsYml.RemoveDiscriminantsFromSchemas.Always
                )
        )
    );
}

function projectFernDocsImportSettings(
    settings: generatorsYml.APIDefinitionSettings | undefined,
    resolvedErrorResponses: generatorsYml.OpenApiErrorResponsesSchema | undefined
): docsYml.RawSchemas.ApiSpecImportSettings | undefined {
    if (settings == null) {
        return undefined;
    }
    return omitUndefinedDocsImportSettings({
        typeDatesAsStrings: settings.typeDatesAsStrings,
        useBytesForBinaryResponse: settings.useBytesForBinaryResponse,
        respectParameterContent: settings.respectParameterContent,
        respectOperationIdWordBoundaries: settings.respectOperationIdWordBoundaries,
        inferForwardCompatible: settings.inferForwardCompatible,
        preserveOneOfInAllOf: settings.preserveOneOfInAllOf,
        anyOfSiblingPropertiesAsObject: settings.anyOfSiblingPropertiesAsObject,
        errorResponses: projectDocsErrorResponses(resolvedErrorResponses ?? settings.errorResponses)
    });
}

function projectRawDocsImportSettings(
    settings: generatorsYml.OpenApiSettingsSchema | undefined,
    workspacePath: string
): docsYml.RawSchemas.ApiSpecImportSettings | undefined {
    if (settings == null) {
        return undefined;
    }
    const errorResponses = settings["error-responses"];
    return omitUndefinedDocsImportSettings({
        typeDatesAsStrings: settings["type-dates-as-strings"],
        useBytesForBinaryResponse: settings["use-bytes-for-binary-response"],
        respectParameterContent: settings["respect-parameter-content"],
        respectOperationIdWordBoundaries: settings["respect-operation-id-word-boundaries"],
        inferForwardCompatible: settings["infer-forward-compatible"],
        preserveOneOfInAllOf: settings["preserve-one-of-in-all-of"],
        anyOfSiblingPropertiesAsObject: settings["any-of-sibling-properties-as-object"],
        errorResponses: projectDocsErrorResponses(errorResponses, workspacePath)
    });
}

function projectDocsErrorResponses(
    errorResponses: generatorsYml.OpenApiErrorResponsesSchema | undefined,
    workspacePath?: string
): docsYml.RawSchemas.ApiSpecErrorResponses | undefined {
    if (errorResponses == null) {
        return undefined;
    }
    return {
        schema:
            workspacePath != null && typeof errorResponses.schema === "string"
                ? path.resolve(workspacePath, errorResponses.schema)
                : errorResponses.schema,
        ...(errorResponses.name == null ? {} : { name: errorResponses.name }),
        ...(errorResponses["apply-to"] == null ? {} : { applyTo: errorResponses["apply-to"] }),
        ...(errorResponses.ensure == null
            ? {}
            : {
                  ensure: errorResponses.ensure.map((entry) => ({
                      statusCode: entry["status-code"],
                      ...(entry.methods == null ? {} : { methods: entry.methods })
                  }))
              })
    };
}

function omitUndefinedDocsImportSettings(
    settings: docsYml.RawSchemas.ApiSpecImportSettings
): docsYml.RawSchemas.ApiSpecImportSettings | undefined {
    const defined = Object.fromEntries(Object.entries(settings).filter(([, value]) => value !== undefined));
    return Object.keys(defined).length === 0 ? undefined : (defined as docsYml.RawSchemas.ApiSpecImportSettings);
}

function normalizeRawPaths(value: generatorsYml.OverridesSchema | undefined): string[] {
    if (value == null) {
        return [];
    }
    const paths = Array.isArray(value) ? value : [value];
    if (paths.some((entry) => typeof entry !== "string")) {
        throw unsupportedSourceType("git override");
    }
    return paths as string[];
}

function projectFernApiImportSettings(
    settings: generatorsYml.APIDefinitionSettings | undefined
): SdkConfigV1SourceSpec["apiImportSettings"] | undefined {
    if (settings == null) {
        return undefined;
    }
    // generators.yml exposes one preference for literal unions. Fern's authoritative settings adapter expands
    // that field into both importer flags, so migration must emit both to preserve existing generation behavior.
    // There is no independently configurable discriminatedUnionV2 field in the generators.yml schema.
    const projected = {
        respectNullableSchemas: settings.respectNullableSchemas,
        titleAsSchemaName: settings.shouldUseTitleAsName,
        coerceEnumsToLiterals: settings.coerceEnumsToLiterals,
        idiomaticRequestNames: settings.shouldUseIdiomaticRequestNames,
        wrapReferencesToNullableInOptional: settings.wrapReferencesToNullableInOptional,
        coerceOptionalSchemasToNullable: settings.coerceOptionalSchemasToNullable,
        pathParameterOrder: settings.pathParameterOrder,
        onlyIncludeReferencedSchemas: settings.onlyIncludeReferencedSchemas,
        objectQueryParameters: settings.objectQueryParameters,
        typeDatesAsStrings: settings.typeDatesAsStrings,
        groupMultiApiEnvironments: settings.groupMultiApiEnvironments,
        ignoreTags: settings.ignoreTags,
        disambiguateRequestNames: settings.disambiguateRequestNames,
        respectReadonlySchemas: settings.respectReadonlySchemas,
        discriminatedUnionV2: settings.shouldUseUndiscriminatedUnionsWithLiterals,
        undiscriminatedUnionsWithLiterals: settings.shouldUseUndiscriminatedUnionsWithLiterals,
        inlineAllOfSchemas: settings.inlineAllOfSchemas,
        resolveSchemaCollisions: settings.resolveSchemaCollisions,
        asyncApiMessageNaming: settings.asyncApiMessageNaming,
        defaultIntegerFormat: settings.defaultIntegerFormat
    };
    const defined = Object.fromEntries(Object.entries(projected).filter(([, value]) => value !== undefined));
    return Object.keys(defined).length === 0 ? undefined : (defined as SdkConfigV1SourceSpec["apiImportSettings"]);
}

function projectRawApiImportSettings(
    settings: generatorsYml.OpenApiSettingsSchema | undefined
): SdkConfigV1SourceSpec["apiImportSettings"] | undefined {
    if (settings == null) {
        return undefined;
    }
    // Keep this raw projection aligned with getAPIDefinitionSettings, which intentionally maps
    // prefer-undiscriminated-unions-with-literals to both importer flags.
    return {
        ...(settings["respect-nullable-schemas"] == null
            ? {}
            : { respectNullableSchemas: settings["respect-nullable-schemas"] }),
        ...(settings["title-as-schema-name"] == null ? {} : { titleAsSchemaName: settings["title-as-schema-name"] }),
        ...(settings["coerce-enums-to-literals"] == null
            ? {}
            : { coerceEnumsToLiterals: settings["coerce-enums-to-literals"] }),
        ...(settings["idiomatic-request-names"] == null
            ? {}
            : { idiomaticRequestNames: settings["idiomatic-request-names"] }),
        ...(settings["wrap-references-to-nullable-in-optional"] == null
            ? {}
            : {
                  wrapReferencesToNullableInOptional: settings["wrap-references-to-nullable-in-optional"]
              }),
        ...(settings["coerce-optional-schemas-to-nullable"] == null
            ? {}
            : {
                  coerceOptionalSchemasToNullable: settings["coerce-optional-schemas-to-nullable"]
              }),
        ...(settings["path-parameter-order"] == null ? {} : { pathParameterOrder: settings["path-parameter-order"] }),
        ...(settings["only-include-referenced-schemas"] == null
            ? {}
            : {
                  onlyIncludeReferencedSchemas: settings["only-include-referenced-schemas"]
              }),
        ...(settings["object-query-parameters"] == null
            ? {}
            : { objectQueryParameters: settings["object-query-parameters"] }),
        ...(settings["type-dates-as-strings"] == null ? {} : { typeDatesAsStrings: settings["type-dates-as-strings"] }),
        ...(settings["group-multi-api-environments"] == null
            ? {}
            : {
                  groupMultiApiEnvironments: settings["group-multi-api-environments"]
              }),
        ...(settings["ignore-tags"] == null ? {} : { ignoreTags: settings["ignore-tags"] }),
        ...(settings["disambiguate-request-names"] == null
            ? {}
            : { disambiguateRequestNames: settings["disambiguate-request-names"] }),
        ...(settings["respect-readonly-schemas"] == null
            ? {}
            : { respectReadonlySchemas: settings["respect-readonly-schemas"] }),
        ...(settings["prefer-undiscriminated-unions-with-literals"] == null
            ? {}
            : {
                  discriminatedUnionV2: settings["prefer-undiscriminated-unions-with-literals"],
                  undiscriminatedUnionsWithLiterals: settings["prefer-undiscriminated-unions-with-literals"]
              }),
        ...(settings["inline-all-of-schemas"] == null ? {} : { inlineAllOfSchemas: settings["inline-all-of-schemas"] }),
        ...(settings["resolve-schema-collisions"] == null
            ? {}
            : { resolveSchemaCollisions: settings["resolve-schema-collisions"] }),
        ...(settings["default-integer-format"] == null
            ? {}
            : { defaultIntegerFormat: settings["default-integer-format"] })
    };
}

function sourceIdFromPath(absolutePath: string): string {
    const extension = path.extname(absolutePath);
    const stem = path.basename(absolutePath, extension);
    return stem.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "spec";
}

function uniqueSourceId(candidate: string, usedIds: Set<string>): string {
    if (!usedIds.has(candidate)) {
        usedIds.add(candidate);
        return candidate;
    }
    let suffix = 2;
    while (usedIds.has(`${candidate}-${suffix}`)) {
        suffix += 1;
    }
    const id = `${candidate}-${suffix}`;
    usedIds.add(id);
    return id;
}

function relativeSourcePath(sourceRoot: string, absolutePath: string): string {
    const relative = toPosixPath(path.relative(sourceRoot, absolutePath));
    return relative.startsWith(".") ? relative : `./${relative}`;
}

function unsupportedSourceType(type: string): CliError {
    return new CliError({
        message: `fern sdk migrate does not currently support Fern source type '${type}'. Support for this source type is planned for a future release.`,
        code: CliError.Code.ConfigError
    });
}
