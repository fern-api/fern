import {
    type AbstractAPIWorkspace,
    type FernDefinition,
    type FernWorkspace,
    getOpenAPISettings,
    type IdentifiableSource,
    type Spec
} from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration-loader";
import { CliError } from "@fern-api/task-context";
import type { SdkConfigV1SourceConfig, SdkConfigV1SourceSpec } from "@postman/sdk-config/sdk-config/v1";
import path from "path";

const DEFAULT_PATH_PARAMETER_STYLE = getOpenAPISettings().inlinePathParameters ? "inline" : "wrapped";

export interface ResolvedMigrationSourceSpec {
    absolutePath: string;
    absoluteOverlayPaths: string[];
    absoluteOverridePaths: string[];
    apiImportSettings?: SdkConfigV1SourceSpec["apiImportSettings"];
    clientPathParameterStyle?: "inline" | "wrapped";
    clientPathParameterStyleExplicit?: boolean;
    hasCustomApiSettings?: boolean;
    idHint?: string;
    name?: string;
    namespace?: string;
    type: SdkConfigV1SourceSpec["type"];
}

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
    if (hasSpecs(workspace)) {
        const configuredDefinitions = getConfiguredDefinitions(workspace.generatorsConfiguration?.api);
        return workspace.allSpecs.map((spec) => {
            const configuredDefinition = findConfiguredDefinition(
                workspace.absoluteFilePath.toString(),
                spec,
                configuredDefinitions
            );
            if (configuredDefinition?.location.gitSource != null) {
                throw new CliError({
                    message: `fern sdk migrate cannot create durable local paths for git-backed API specification '${configuredDefinition.location.gitSource.path}' from '${configuredDefinition.location.gitSource.repo}'. Move the specification into the project or migrate this configuration manually.`,
                    code: CliError.Code.ConfigError
                });
            }
            return resolveWorkspaceSpec(spec, configuredDefinition?.location.settings);
        });
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
    const serializedSpecs = specs.map((spec) => {
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

export function resolveMigrationPathParameterStyle(
    specs: ResolvedMigrationSourceSpec[]
): "inline" | "wrapped" | undefined {
    const explicitlyConfiguredSpecs = specs.filter(
        (spec) => spec.type === "openapi" && spec.clientPathParameterStyleExplicit === true
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
    return specs
        .flatMap((spec) => [spec.absolutePath, ...spec.absoluteOverlayPaths, ...spec.absoluteOverridePaths])
        .reduce(commonAncestor, path.resolve(workingDirectory));
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

function hasSpecs(workspace: AbstractAPIWorkspace<unknown>): workspace is AbstractAPIWorkspace<unknown> & {
    allSpecs: Spec[];
} {
    return "allSpecs" in workspace && Array.isArray(workspace.allSpecs);
}

function resolveWorkspaceSpec(
    spec: Spec,
    settings: generatorsYml.APIDefinitionSettings | undefined
): ResolvedMigrationSourceSpec {
    switch (spec.type) {
        case "openapi":
            if (spec.source.type === "protobuf") {
                throw unsupportedSourceType(spec.source.type);
            }
            return {
                absolutePath: spec.absoluteFilepath,
                absoluteOverlayPaths: spec.absoluteFilepathToOverlays == null ? [] : [spec.absoluteFilepathToOverlays],
                absoluteOverridePaths: normalizePaths(spec.absoluteFilepathToOverrides),
                apiImportSettings: projectFernApiImportSettings(settings),
                hasCustomApiSettings: hasDefinedSettings(settings),
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
        case "protobuf":
        case "openrpc":
            throw unsupportedSourceType(spec.type);
    }
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
    definitions: ConfiguredDefinition[]
): ConfiguredDefinition | undefined {
    const matches = definitions.filter(
        (definition) =>
            definition.namespace === specNamespace(spec) &&
            definitionMatchesSpecType(definition.location, spec) &&
            definitionMatchesSpecPath(workspacePath, definition.location, spec)
    );
    return matches.length === 1 ? matches[0] : undefined;
}

function definitionMatchesSpecType(definition: generatorsYml.APIDefinitionLocation, spec: Spec): boolean {
    switch (spec.type) {
        case "openapi":
            return definition.schema.type === "oss";
        case "graphql":
            return definition.schema.type === "graphql";
        case "openrpc":
            return definition.schema.type === "openrpc";
        case "protobuf":
            return definition.schema.type === "protobuf";
    }
}

function definitionMatchesSpecPath(
    workspacePath: string,
    definition: generatorsYml.APIDefinitionLocation,
    spec: Spec
): boolean {
    const specPath = absoluteSpecPath(spec);
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

function absoluteSpecPath(spec: Spec): string {
    return path.normalize(
        spec.type === "protobuf" ? spec.absoluteFilepathToProtobufRoot.toString() : spec.absoluteFilepath.toString()
    );
}

function specNamespace(spec: Spec): string | undefined {
    return spec.type === "protobuf" ? undefined : spec.namespace;
}

function resolveIdentifiableSource(source: IdentifiableSource): ResolvedMigrationSourceSpec {
    if (source.type === "protobuf") {
        throw unsupportedSourceType(source.type);
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
    return specs.map((spec) => {
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
            hasCustomApiSettings: hasDefinedSettings(spec.settings),
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

function hasDefinedSettings(settings: object | undefined): boolean {
    return (
        settings != null &&
        Object.entries(settings).some(
            ([key, value]) =>
                value !== undefined &&
                !(
                    key === "removeDiscriminantsFromSchemas" &&
                    value === generatorsYml.RemoveDiscriminantsFromSchemas.Always
                )
        )
    );
}

function normalizePaths(value: string | string[] | undefined): string[] {
    return value == null ? [] : Array.isArray(value) ? value : [value];
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
    const relative = path.relative(sourceRoot, absolutePath).split(path.sep).join("/");
    return relative.startsWith(".") ? relative : `./${relative}`;
}

function unsupportedSourceType(type: string): CliError {
    return new CliError({
        message: `fern sdk migrate does not currently support Fern source type '${type}'. Support for this source type is planned for a future release.`,
        code: CliError.Code.ConfigError
    });
}
