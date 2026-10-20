import { getAPIDefinitionSettings, OpenAPISpec, ProtobufSpec, Spec } from "@fern-api/api-workspace-commons";
import { generatorsYml, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import {
    ConjureWorkspace,
    LazyFernWorkspace,
    OSSWorkspace,
    WorkspaceLoader,
    WorkspaceLoaderFailureType
} from "@fern-api/lazy-fern-workspace";
import {
    DEFINITION_DIRECTORY,
    definitionDirectoryExists,
    GENERATORS_CONFIGURATION_FILENAME,
    OPENAPI_DIRECTORY
} from "@fern-api/project-structure";
import { TaskContext } from "@fern-api/task-context";
import path from "path";
import { loadAPIChangelog } from "./loadAPIChangelog.js";
import { resolveRemoteSpecs } from "./resolveRemoteSpecs.js";

type Schema<Type extends generatorsYml.APIDefinitionLocation["schema"]["type"]> = Extract<
    generatorsYml.APIDefinitionLocation["schema"],
    { type: Type }
>;

export async function loadSingleNamespaceAPIWorkspace({
    absolutePathToWorkspace,
    namespace,
    definitions
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    namespace: string | undefined;
    definitions: generatorsYml.APIDefinitionLocation[];
}): Promise<Spec[] | WorkspaceLoader.Result> {
    const specs: Spec[] = [];
    for (const definition of definitions) {
        const spec = await loadSpec({ definition, absolutePathToWorkspace, namespace });
        if (isFailedResult(spec)) {
            return spec;
        }
        specs.push(spec);
    }
    return specs;
}

async function loadSpec({
    definition,
    absolutePathToWorkspace,
    namespace
}: {
    definition: generatorsYml.APIDefinitionLocation;
    absolutePathToWorkspace: AbsoluteFilePath;
    namespace: string | undefined;
}): Promise<Spec | WorkspaceLoader.FailedResult> {
    const absoluteFilepathToOverrides = resolveOverrides(absolutePathToWorkspace, definition.overrides);
    switch (definition.schema.type) {
        case "protobuf":
            return await loadProtobufSpec({
                definition,
                schema: definition.schema,
                absolutePathToWorkspace,
                absoluteFilepathToOverrides
            });
        case "openrpc":
            return {
                type: "openrpc",
                absoluteFilepath: join(absolutePathToWorkspace, RelativeFilePath.of(definition.schema.path)),
                absoluteFilepathToOverrides,
                namespace
            };
        case "graphql":
            return await loadGraphqlSpec({
                schema: definition.schema,
                absolutePathToWorkspace,
                absoluteFilepathToOverrides,
                namespace
            });
        default:
            return await loadOpenApiSpec({
                definition,
                schema: definition.schema,
                absolutePathToWorkspace,
                absoluteFilepathToOverrides,
                namespace
            });
    }
}

async function loadProtobufSpec({
    definition,
    schema,
    absolutePathToWorkspace,
    absoluteFilepathToOverrides
}: {
    definition: generatorsYml.APIDefinitionLocation;
    schema: Schema<"protobuf">;
    absolutePathToWorkspace: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
}): Promise<ProtobufSpec | WorkspaceLoader.FailedResult> {
    const root = resolveSourcePath(absolutePathToWorkspace, schema.root, definition.resolvedAbsolutePath);
    if (!(await doesPathExist(root.absolute))) {
        // The key is not the basename here, so a missing root from a resolved git source (an absolute path) throws.
        return missingFile(RelativeFilePath.of(schema.root));
    }

    // An empty target means 'strategy: all' from the root, so no target is specified.
    const target =
        schema.target.length === 0
            ? undefined
            : resolveSourcePath(absolutePathToWorkspace, schema.target, definition.resolvedAbsolutePath);
    if (target != null && !(await doesPathExist(target.absolute))) {
        return missingFile(target.relative);
    }

    return {
        type: "protobuf",
        absoluteFilepathToProtobufRoot: root.absolute,
        absoluteFilepathToProtobufTarget: target?.absolute,
        absoluteFilepathToOverrides,
        relativeFilepathToProtobufRoot: root.relative,
        dependencies: schema.dependencies,
        generateLocally: schema.localGeneration,
        fromOpenAPI: schema.fromOpenAPI,
        settings: {
            ...getAPIDefinitionSettings(definition.settings),
            audiences: definition.audiences ?? []
        }
    };
}

async function loadGraphqlSpec({
    schema,
    absolutePathToWorkspace,
    absoluteFilepathToOverrides,
    namespace
}: {
    schema: Schema<"graphql">;
    absolutePathToWorkspace: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
    namespace: string | undefined;
}): Promise<Spec | WorkspaceLoader.FailedResult> {
    const relativeFilepath = RelativeFilePath.of(schema.path);
    const absoluteFilepath = join(absolutePathToWorkspace, relativeFilepath);
    if (!(await doesPathExist(absoluteFilepath))) {
        return missingFile(relativeFilepath);
    }

    let absoluteFilepathToExamples: AbsoluteFilePath | undefined;
    if (schema.examples != null) {
        const relativeFilepathToExamples = RelativeFilePath.of(schema.examples);
        absoluteFilepathToExamples = join(absolutePathToWorkspace, relativeFilepathToExamples);
        if (!(await doesPathExist(absoluteFilepathToExamples))) {
            return missingFile(relativeFilepathToExamples);
        }
    }

    return { type: "graphql", absoluteFilepath, absoluteFilepathToOverrides, absoluteFilepathToExamples, namespace };
}

async function loadOpenApiSpec({
    definition,
    schema,
    absolutePathToWorkspace,
    absoluteFilepathToOverrides,
    namespace
}: {
    definition: generatorsYml.APIDefinitionLocation;
    schema: Schema<"oss">;
    absolutePathToWorkspace: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
    namespace: string | undefined;
}): Promise<Spec | WorkspaceLoader.FailedResult> {
    // Only a resolved git source may use an absolute path.
    if (path.isAbsolute(schema.path) && !definition.resolvedAbsolutePath) {
        return {
            didSucceed: false,
            failures: {
                [RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME)]: {
                    type: WorkspaceLoaderFailureType.ABSOLUTE_FILEPATH,
                    filepath: schema.path
                }
            }
        };
    }

    const spec = resolveSourcePath(absolutePathToWorkspace, schema.path, definition.resolvedAbsolutePath);
    const absoluteFilepathToOverlays =
        definition.overlays != null
            ? join(absolutePathToWorkspace, RelativeFilePath.of(definition.overlays))
            : undefined;
    const apiSettings = getAPIDefinitionSettings(definition.settings);
    const errorResponsesSchema =
        typeof apiSettings.errorResponses?.schema === "string"
            ? join(absolutePathToWorkspace, RelativeFilePath.of(apiSettings.errorResponses.schema))
            : undefined;

    // The files are checked in this order: the spec, its overrides, its overlays, then the error responses schema.
    const filesToCheck: Array<{ absolute: AbsoluteFilePath; relative: RelativeFilePath } | undefined> = [
        spec,
        ...toArray(definition.overrides).map((override) => resolveSourcePath(absolutePathToWorkspace, override, false)),
        definition.overlays != null && absoluteFilepathToOverlays != null
            ? { absolute: absoluteFilepathToOverlays, relative: RelativeFilePath.of(definition.overlays) }
            : undefined,
        errorResponsesSchema != null && typeof apiSettings.errorResponses?.schema === "string"
            ? { absolute: errorResponsesSchema, relative: RelativeFilePath.of(apiSettings.errorResponses.schema) }
            : undefined
    ];
    for (const file of filesToCheck) {
        if (file != null && !(await doesPathExist(file.absolute))) {
            return missingFile(file.relative);
        }
    }

    const settings =
        apiSettings.errorResponses != null && errorResponsesSchema != null
            ? { ...apiSettings, errorResponses: { ...apiSettings.errorResponses, schema: errorResponsesSchema } }
            : apiSettings;
    return {
        type: "openapi",
        absoluteFilepath: spec.absolute,
        absoluteFilepathToOverrides,
        absoluteFilepathToOverlays,
        settings: { ...settings, audiences: definition.audiences ?? [] },
        source: { type: schema.sourceType ?? "openapi", file: spec.absolute },
        namespace
    };
}

export async function loadAPIWorkspace({
    absolutePathToWorkspace,
    context,
    cliVersion,
    workspaceName,
    lenient
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    cliVersion: string;
    workspaceName: string | undefined;
    /** If true, use lenient parsing that tolerates unrecognized keys/union members */
    lenient?: boolean;
}): Promise<WorkspaceLoader.Result> {
    const [generatorsConfiguration, changelog] = await Promise.all([
        loadGeneratorsConfiguration({
            absolutePathToWorkspace,
            context,
            lenient
        }),
        loadAPIChangelog({ absolutePathToWorkspace }).catch(() => undefined)
    ]);

    const api = generatorsConfiguration?.api;
    if (generatorsConfiguration != null && api?.type === "conjure") {
        return {
            didSucceed: true,
            workspace: new ConjureWorkspace({
                workspaceName,
                absoluteFilePath: absolutePathToWorkspace,
                generatorsConfiguration,
                changelog,
                cliVersion,
                context,
                relativePathToConjureDirectory: RelativeFilePath.of(api.pathToConjureDefinition)
            })
        };
    }

    if (generatorsConfiguration != null && api != null && declaresSpecs(api)) {
        const specs = await loadDeclaredSpecs({ api, absolutePathToWorkspace, context });
        if (!Array.isArray(specs)) {
            return specs;
        }
        const workspace = new OSSWorkspace({
            specs: specs.filter(isParsedAsOpenApi) as (OpenAPISpec | ProtobufSpec)[],
            allSpecs: specs.filter((spec) => !isProtobufFromOpenApi(spec)),
            workspaceName,
            absoluteFilePath: absolutePathToWorkspace,
            generatorsConfiguration,
            changelog,
            cliVersion
        });
        // Process GraphQL specs and populate workspace with operations and types
        await workspace.processGraphQLSpecs(context);
        return { didSucceed: true, workspace };
    }

    if (await definitionDirectoryExists(absolutePathToWorkspace)) {
        return {
            didSucceed: true,
            workspace: new LazyFernWorkspace({
                absoluteFilePath: absolutePathToWorkspace,
                generatorsConfiguration,
                workspaceName,
                changelog,
                context,
                cliVersion,
                loadAPIWorkspace
            })
        };
    }

    // There is no definition/ directory here, so it counts as empty.
    const apiFolderName = absolutePathToWorkspace.split("/").pop();
    context.logger.warn(`Detected empty API definition: ${apiFolderName}. Remove to resolve error.`);
    context.logger.debug(`Workspace diagnostic: ${describeMissingApi(generatorsConfiguration)}`);

    return {
        didSucceed: false,
        failures: {
            [RelativeFilePath.of(OPENAPI_DIRECTORY)]: {
                type: WorkspaceLoaderFailureType.MISCONFIGURED_DIRECTORY
            }
        }
    };
}

type DeclaredSpecsApi = Extract<
    NonNullable<generatorsYml.GeneratorsConfiguration["api"]>,
    { type: "singleNamespace" | "multiNamespace" }
>;

function declaresSpecs(api: NonNullable<generatorsYml.GeneratorsConfiguration["api"]>): api is DeclaredSpecsApi {
    return (api.type === "singleNamespace" && api.definitions.length > 0) || api.type === "multiNamespace";
}

/** Loads the specs of every namespace, or returns the failure of the first namespace that has one. */
async function loadDeclaredSpecs({
    api,
    absolutePathToWorkspace,
    context
}: {
    api: DeclaredSpecsApi;
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<Spec[] | WorkspaceLoader.Result> {
    const loadNamespace = async (namespace: string | undefined, definitions: generatorsYml.APIDefinitionLocation[]) =>
        await loadSingleNamespaceAPIWorkspace({
            absolutePathToWorkspace,
            namespace,
            definitions: await resolveRemoteSpecs({ definitions, context })
        });

    if (api.type === "singleNamespace") {
        return await loadNamespace(undefined, api.definitions);
    }

    const namespaceResults = await Promise.all(
        Object.entries(api.definitions).map(
            async ([namespace, definitions]) => await loadNamespace(namespace, definitions)
        )
    );
    const rootResults = api.rootDefinitions != null ? [await loadNamespace(undefined, api.rootDefinitions)] : [];

    const specs: Spec[] = [];
    for (const result of [...namespaceResults, ...rootResults]) {
        if (!Array.isArray(result)) {
            return result;
        }
        specs.push(...result);
    }
    return specs;
}

/** OpenRPC specs are not parsed as OpenAPI, and protobuf specs only are when they come from an OpenAPI spec. */
function isParsedAsOpenApi(spec: Spec): boolean {
    return spec.type !== "openrpc" && (spec.type !== "protobuf" || spec.fromOpenAPI);
}

function isProtobufFromOpenApi(spec: Spec): boolean {
    return spec.type === "protobuf" && spec.fromOpenAPI;
}

function describeMissingApi(generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined): string {
    const hints: string[] = [];
    if (generatorsConfiguration == null) {
        hints.push(`No ${GENERATORS_CONFIGURATION_FILENAME} was found.`);
    } else if (generatorsConfiguration.api == null) {
        hints.push(`${GENERATORS_CONFIGURATION_FILENAME} was found but does not contain an "api" section.`);
    } else {
        hints.push(
            `${GENERATORS_CONFIGURATION_FILENAME} has an "api" section but no valid API specs could be resolved from it.`
        );
    }
    hints.push(`No "${DEFINITION_DIRECTORY}/" directory was found.`);
    return hints.join(" ");
}

function missingFile(filepath: RelativeFilePath): WorkspaceLoader.FailedResult {
    return { didSucceed: false, failures: { [filepath]: { type: WorkspaceLoaderFailureType.FILE_MISSING } } };
}

function isFailedResult(value: Spec | WorkspaceLoader.FailedResult): value is WorkspaceLoader.FailedResult {
    return "didSucceed" in value;
}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (value == null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

/** Keeps a single override a single path and several overrides a list, as the specs expect. */
function resolveOverrides(
    absolutePathToWorkspace: AbsoluteFilePath,
    overrides: string | string[] | undefined
): AbsoluteFilePath | AbsoluteFilePath[] | undefined {
    if (overrides == null) {
        return undefined;
    }
    const toAbsolute = (override: string) => join(absolutePathToWorkspace, RelativeFilePath.of(override));
    return Array.isArray(overrides) ? overrides.map(toAbsolute) : toAbsolute(overrides);
}

/**
 * Resolves a path from a definition. A path from a resolved git source is absolute and used as it is, with its
 * basename for messages. Any other path is relative to the workspace.
 */
function resolveSourcePath(
    absolutePathToWorkspace: AbsoluteFilePath,
    filepath: string,
    isResolvedFromGit: boolean | undefined
): { absolute: AbsoluteFilePath; relative: RelativeFilePath } {
    if (path.isAbsolute(filepath) && isResolvedFromGit) {
        return { absolute: AbsoluteFilePath.of(filepath), relative: RelativeFilePath.of(path.basename(filepath)) };
    }
    return {
        absolute: join(absolutePathToWorkspace, RelativeFilePath.of(filepath)),
        relative: RelativeFilePath.of(filepath)
    };
}
