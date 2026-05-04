import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { docsYml } from "@fern-api/configuration";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { APIV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import type { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { CliError, TaskContext } from "@fern-api/task-context";
import {
    DocsWorkspace,
    FernWorkspace,
    handleFailedWorkspaceParserResult,
    loadAPIWorkspace
} from "@fern-api/workspace-loader";

export type RegisterApiDefinitionOptions = {
    ir: IntermediateRepresentation;
    snippetsConfig: APIV1Write.SnippetsConfig;
    playgroundConfig?: Pick<docsYml.RawSchemas.PlaygroundSettings, "oauth">;
    apiName?: string;
    workspace?: FernWorkspace;
    graphqlOperations?: Record<APIV1Write.GraphQlOperationId, APIV1Write.GraphQlOperation>;
    graphqlTypes?: Record<APIV1Write.TypeId, APIV1Write.TypeDefinition>;
    precomputedApiDefinition?: ReturnType<typeof convertIrToFdrApi>;
    trackAsBaseApi?: boolean;
};

export type RegisteredApiConfig = Pick<
    RegisterApiDefinitionOptions,
    "snippetsConfig" | "playgroundConfig" | "graphqlOperations" | "graphqlTypes"
> & {
    endpointKeys?: string[];
};

export type ApiNavigationTitleOverrides = {
    endpointTitlesById: Map<string, string>;
};

export type TranslatedApiNavigationTitleOverridesByLocale = Map<string, Map<string, ApiNavigationTitleOverrides>>;

export async function registerTranslatedApiOverrides({
    docsWorkspace,
    cliVersion,
    context,
    registeredApiIdsByName,
    registeredApiConfigsByName,
    registerApiDefinition,
    translatedApiNavigationTitleOverridesByLocale
}: {
    docsWorkspace: DocsWorkspace;
    cliVersion: string | undefined;
    context: TaskContext;
    registeredApiIdsByName: Map<string, string>;
    registeredApiConfigsByName: Map<string, RegisteredApiConfig>;
    registerApiDefinition: (opts: RegisterApiDefinitionOptions) => Promise<string>;
    translatedApiNavigationTitleOverridesByLocale?: TranslatedApiNavigationTitleOverridesByLocale;
}): Promise<Map<string, Map<string, string>>> {
    const locales = getNonDefaultTranslationLocales(docsWorkspace.config.translations);
    const translatedApiDefinitionIdsByLocale = new Map<string, Map<string, string>>();
    if (locales.length === 0 || registeredApiIdsByName.size === 0) {
        return translatedApiDefinitionIdsByLocale;
    }

    for (const locale of locales) {
        const apiIdOverrides = new Map<string, string>();
        for (const [apiName, baseApiDefinitionId] of registeredApiIdsByName.entries()) {
            const translatedWorkspacePath = await getTranslatedApiWorkspacePath({
                docsWorkspace,
                locale,
                apiName,
                allowDefaultApiOverride: registeredApiIdsByName.size === 1
            });
            if (translatedWorkspacePath == null) {
                continue;
            }

            context.logger.info(`Registering translated API "${apiName}" for locale "${locale}"...`);
            const baseConfig = registeredApiConfigsByName.get(apiName);
            const { ir, workspace } = await loadTranslatedApiWorkspace({
                docsWorkspace,
                translatedWorkspacePath,
                apiName,
                locale,
                cliVersion,
                context
            });
            warnIfTranslatedApiIsMissingEndpoints({
                baseEndpointKeys: baseConfig?.endpointKeys ?? [],
                translatedEndpointKeys: getHttpEndpointKeys(ir),
                apiName,
                locale,
                context
            });
            const precomputedApiDefinition = addTranslatedApiNavigationTitleOverrides({
                translatedApiNavigationTitleOverridesByLocale,
                locale,
                baseApiDefinitionId,
                ir,
                apiName,
                baseConfig,
                context
            });
            const translatedApiDefinitionId = await registerApiDefinition({
                ir,
                apiName,
                snippetsConfig: baseConfig?.snippetsConfig ?? {},
                playgroundConfig: baseConfig?.playgroundConfig,
                graphqlOperations: baseConfig?.graphqlOperations,
                graphqlTypes: baseConfig?.graphqlTypes,
                precomputedApiDefinition,
                workspace,
                trackAsBaseApi: false
            });
            apiIdOverrides.set(baseApiDefinitionId, translatedApiDefinitionId);
            context.logger.debug(
                `Registered translated API "${apiName}" for locale "${locale}": ${translatedApiDefinitionId}`
            );
        }

        if (apiIdOverrides.size > 0) {
            translatedApiDefinitionIdsByLocale.set(locale, apiIdOverrides);
        }
    }

    return translatedApiDefinitionIdsByLocale;
}

export function getNonDefaultTranslationLocales(
    translations: docsYml.RawSchemas.TranslationConfig[] | undefined
): string[] {
    if (translations == null || translations.length === 0) {
        return [];
    }
    const normalizedTranslations = translations.map((translation) =>
        docsYml.DocsYmlSchemas.normalizeTranslationConfig(translation)
    );
    const defaultTranslation =
        normalizedTranslations.find((translation) => translation.default === true) ?? normalizedTranslations[0];
    return normalizedTranslations
        .map((translation) => translation.lang)
        .filter((locale) => locale !== defaultTranslation?.lang);
}

export async function getTranslatedApiWorkspacePath({
    docsWorkspace,
    locale,
    apiName,
    allowDefaultApiOverride = false
}: {
    docsWorkspace: Pick<DocsWorkspace, "absoluteFilePath">;
    locale: string;
    apiName: string;
    allowDefaultApiOverride?: boolean;
}): Promise<AbsoluteFilePath | undefined> {
    const candidates = [
        join(docsWorkspace.absoluteFilePath, RelativeFilePath.of(`translations/${locale}/apis/${apiName}`)),
        join(docsWorkspace.absoluteFilePath, RelativeFilePath.of(`translations/${locale}/fern/apis/${apiName}`))
    ];
    if (allowDefaultApiOverride) {
        candidates.push(
            join(docsWorkspace.absoluteFilePath, RelativeFilePath.of(`translations/${locale}`)),
            join(docsWorkspace.absoluteFilePath, RelativeFilePath.of(`translations/${locale}/fern`))
        );
    }

    for (const candidate of candidates) {
        const hasGeneratorsYml = await doesPathExist(join(candidate, RelativeFilePath.of("generators.yml")));
        const hasDefinition = await doesPathExist(join(candidate, RelativeFilePath.of("definition")));
        if (hasGeneratorsYml || hasDefinition) {
            return candidate;
        }
    }

    return undefined;
}

async function loadTranslatedApiWorkspace({
    docsWorkspace,
    translatedWorkspacePath,
    apiName,
    locale,
    cliVersion,
    context
}: {
    docsWorkspace: DocsWorkspace;
    translatedWorkspacePath: AbsoluteFilePath;
    apiName: string;
    locale: string;
    cliVersion: string | undefined;
    context: TaskContext;
}): Promise<{ ir: IntermediateRepresentation; workspace?: FernWorkspace }> {
    const loadedWorkspace = await loadAPIWorkspace({
        absolutePathToWorkspace: translatedWorkspacePath,
        context,
        cliVersion: cliVersion ?? "*",
        workspaceName: apiName,
        lenient: true
    });

    if (!loadedWorkspace.didSucceed) {
        handleFailedWorkspaceParserResult(loadedWorkspace, context.logger);
        return context.failAndThrow(`Failed to load translated API "${apiName}" for locale "${locale}".`, undefined, {
            code: CliError.Code.ConfigError
        });
    }

    if (loadedWorkspace.workspace instanceof OSSWorkspace) {
        let ir = await loadedWorkspace.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });
        if (docsWorkspace.config.settings?.substituteEnvVars) {
            ir = replaceEnvVariables(
                ir,
                {
                    onError: (e) =>
                        context.failAndThrow(
                            `Error substituting environment variables in translated API spec: ${e}`,
                            undefined,
                            { code: CliError.Code.EnvironmentError }
                        )
                },
                { substituteAsEmpty: false }
            );
        }

        let fernWorkspace: FernWorkspace | undefined;
        try {
            fernWorkspace = await loadedWorkspace.workspace.toFernWorkspace(
                { context },
                {
                    enableUniqueErrorsPerEndpoint: true,
                    detectGlobalHeaders: false,
                    objectQueryParameters: true,
                    preserveSchemaIds: true
                }
            );
        } catch (error) {
            context.logger.debug(
                `Could not load translated workspace for ${locale}/${apiName}: ${String(error)}. Dynamic snippets may be unavailable.`
            );
        }
        return { ir, workspace: fernWorkspace };
    }

    const fernWorkspace = await loadedWorkspace.workspace.toFernWorkspace(
        { context },
        {
            enableUniqueErrorsPerEndpoint: true,
            detectGlobalHeaders: false,
            objectQueryParameters: true,
            preserveSchemaIds: true
        }
    );
    let ir = generateIntermediateRepresentation({
        workspace: fernWorkspace,
        audiences: { type: "all" },
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false,
        exampleGeneration: {
            disabled: false,
            skipAutogenerationIfManualExamplesExist: true,
            skipErrorAutogenerationIfManualErrorExamplesExist: true
        },
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    });
    if (docsWorkspace.config.settings?.substituteEnvVars) {
        ir = replaceEnvVariables(
            ir,
            {
                onError: (e) =>
                    context.failAndThrow(
                        `Error substituting environment variables in translated API spec: ${e}`,
                        undefined,
                        { code: CliError.Code.EnvironmentError }
                    )
            },
            { substituteAsEmpty: false }
        );
    }

    return { ir, workspace: fernWorkspace };
}

export function replaceApiDefinitionIdsInObject<T>(value: T, replacements: Map<string, string>): T {
    if (Array.isArray(value)) {
        return value.map((item) => replaceApiDefinitionIdsInObject(item, replacements)) as T;
    }
    if (value != null && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return Object.fromEntries(
            Object.entries(record).map(([key, child]) => {
                if (key === "apiDefinitionId" && typeof child === "string") {
                    return [key, replacements.get(child) ?? child];
                }
                return [key, replaceApiDefinitionIdsInObject(child, replacements)];
            })
        ) as T;
    }
    return value;
}

export function applyTranslatedApiNavigationTitlesInObject<T>(
    value: T,
    replacements: Map<string, ApiNavigationTitleOverrides>
): T {
    if (Array.isArray(value)) {
        return value.map((item) => applyTranslatedApiNavigationTitlesInObject(item, replacements)) as T;
    }
    if (value != null && typeof value === "object") {
        const record = value as Record<string, unknown>;
        const translatedRecord = Object.fromEntries(
            Object.entries(record).map(([key, child]) => [
                key,
                applyTranslatedApiNavigationTitlesInObject(child, replacements)
            ])
        );
        if (record.type === "endpoint") {
            const apiDefinitionId = record.apiDefinitionId;
            const endpointId = record.endpointId;
            if (typeof apiDefinitionId === "string" && typeof endpointId === "string") {
                const translatedTitle = replacements.get(apiDefinitionId)?.endpointTitlesById.get(endpointId);
                if (translatedTitle != null) {
                    return {
                        ...translatedRecord,
                        title: translatedTitle
                    } as T;
                }
            }
        }
        return translatedRecord as T;
    }
    return value;
}

export function getHttpEndpointKeys(ir: IntermediateRepresentation): string[] {
    const endpointKeys = new Set<string>();
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            endpointKeys.add(`${endpoint.method} ${stringifyHttpPath(endpoint.fullPath)}`);
        }
    }
    return Array.from(endpointKeys).sort();
}

export function getMissingEndpointKeys({
    baseEndpointKeys,
    translatedEndpointKeys
}: {
    baseEndpointKeys: string[];
    translatedEndpointKeys: string[];
}): string[] {
    const translatedEndpointKeySet = new Set(translatedEndpointKeys);
    return baseEndpointKeys.filter((endpointKey) => !translatedEndpointKeySet.has(endpointKey));
}

function addTranslatedApiNavigationTitleOverrides({
    translatedApiNavigationTitleOverridesByLocale,
    locale,
    baseApiDefinitionId,
    ir,
    apiName,
    baseConfig,
    context
}: {
    translatedApiNavigationTitleOverridesByLocale: TranslatedApiNavigationTitleOverridesByLocale | undefined;
    locale: string;
    baseApiDefinitionId: string;
    ir: IntermediateRepresentation;
    apiName: string;
    baseConfig: RegisteredApiConfig | undefined;
    context: TaskContext;
}): ReturnType<typeof convertIrToFdrApi> | undefined {
    if (translatedApiNavigationTitleOverridesByLocale == null) {
        return undefined;
    }
    const apiDefinition = convertIrToFdrApi({
        ir,
        snippetsConfig: baseConfig?.snippetsConfig ?? {},
        playgroundConfig: baseConfig?.playgroundConfig,
        graphqlOperations: baseConfig?.graphqlOperations,
        graphqlTypes: baseConfig?.graphqlTypes,
        context,
        apiNameOverride: apiName
    });
    const titleOverrides = getApiNavigationTitleOverrides(apiDefinition);
    if (titleOverrides.endpointTitlesById.size === 0) {
        return apiDefinition;
    }
    const localeOverrides = translatedApiNavigationTitleOverridesByLocale.get(locale) ?? new Map();
    localeOverrides.set(baseApiDefinitionId, titleOverrides);
    translatedApiNavigationTitleOverridesByLocale.set(locale, localeOverrides);
    return apiDefinition;
}

function getApiNavigationTitleOverrides(
    apiDefinition: ReturnType<typeof convertIrToFdrApi>
): ApiNavigationTitleOverrides {
    const endpointTitlesById = new Map<string, string>();
    addEndpointNavigationTitleOverrides(endpointTitlesById, apiDefinition.rootPackage, ROOT_PACKAGE_ID);
    for (const [subpackageId, subpackage] of Object.entries(apiDefinition.subpackages)) {
        addEndpointNavigationTitleOverrides(endpointTitlesById, subpackage, subpackageId);
    }
    return { endpointTitlesById };
}

function addEndpointNavigationTitleOverrides(
    endpointTitlesById: Map<string, string>,
    pkg: ReturnType<typeof convertIrToFdrApi>["rootPackage"],
    subpackageId: string
): void {
    for (const endpoint of pkg.endpoints) {
        if (endpoint.name != null) {
            endpointTitlesById.set(getEndpointNavigationId(endpoint, subpackageId), endpoint.name);
        }
    }
}

function getEndpointNavigationId(
    endpoint: ReturnType<typeof convertIrToFdrApi>["rootPackage"]["endpoints"][number],
    subpackageId: string
): string {
    return endpoint.originalEndpointId ?? `${subpackageId}.${endpoint.id}`;
}

function warnIfTranslatedApiIsMissingEndpoints({
    baseEndpointKeys,
    translatedEndpointKeys,
    apiName,
    locale,
    context
}: {
    baseEndpointKeys: string[];
    translatedEndpointKeys: string[];
    apiName: string;
    locale: string;
    context: TaskContext;
}): void {
    const missingEndpointKeys = getMissingEndpointKeys({ baseEndpointKeys, translatedEndpointKeys });
    if (missingEndpointKeys.length === 0) {
        return;
    }

    const preview = missingEndpointKeys.slice(0, 10).join(", ");
    const suffix = missingEndpointKeys.length > 10 ? `, and ${missingEndpointKeys.length - 10} more` : "";
    context.logger.warn(
        `Translated API "${apiName}" for locale "${locale}" is missing ${missingEndpointKeys.length} endpoint(s) from the default API. ` +
            `The default docs navigation may link to unavailable translated API pages: ${preview}${suffix}.`
    );
}

function stringifyHttpPath(path: IntermediateRepresentation["basePath"]): string {
    if (path == null) {
        return "";
    }
    return `${path.head}${path.parts.map((part) => `{${part.pathParameter}}${part.tail}`).join("")}`;
}

const ROOT_PACKAGE_ID = "__package__";
