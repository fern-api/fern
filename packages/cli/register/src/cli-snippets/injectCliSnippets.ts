import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import { assembleCliCommand } from "./assembleCliCommand.js";
import { buildCatalogIndex, CliCatalogIndex, loadCliCatalog } from "./catalog.js";
import { CliCatalog, CliSnippetsConfig } from "./types.js";

/** The language key under which CLI snippets are stored on an FDR example. Renders as a "CLI" tab. */
export const CLI_SNIPPET_LANGUAGE = "cli";

type ApiDefinition = FdrCjsSdk.api.v1.register.ApiDefinition;
type EndpointDefinition = FdrCjsSdk.api.v1.register.EndpointDefinition;

export interface CliSnippetInjectionStats {
    /** Endpoints considered (REST endpoints across the root package and all subpackages). */
    totalEndpoints: number;
    /** Endpoints that matched a catalog command. */
    matchedEndpoints: number;
    /** Individual example code-samples injected. */
    injectedSamples: number;
}

/**
 * Reconstruct the OpenAPI path string from an FDR endpoint's path parts, reproducing the catalog's
 * `{Sid}`-style casing. FDR stores the path as parts (literals + path-parameter references), not a
 * string, and the example's own `path` field is value-substituted — so the join must happen here.
 */
export function reconstructOpenApiPath(path: EndpointDefinition["path"]): string {
    return (path?.parts ?? []).map((part) => (part.type === "literal" ? part.value : `{${part.value}}`)).join("");
}

/**
 * Map every subpackage id to the NAME of its top-level ancestor subpackage (a direct child of the
 * root package). The docs `namespaces` config is keyed on that top-level name (e.g. "v2010"), not on
 * the leaf subpackage an endpoint happens to live in (e.g. "messages") — an API with namespaces nests
 * its endpoints under the top-level subpackage, so joining on the leaf name would never match.
 */
function buildTopLevelNameBySubpackageId(apiDefinition: ApiDefinition): Map<string, string> {
    const topLevelName = new Map<string, string>();
    const assign = (subpackageId: string, name: string): void => {
        if (topLevelName.has(subpackageId)) {
            return;
        }
        const subpackage = apiDefinition.subpackages[FdrCjsSdk.SubpackageId(subpackageId)];
        if (subpackage == null) {
            return;
        }
        topLevelName.set(subpackageId, name);
        for (const childId of subpackage.subpackages ?? []) {
            assign(childId, name);
        }
    };
    for (const topLevelId of apiDefinition.rootPackage.subpackages ?? []) {
        const subpackage = apiDefinition.subpackages[FdrCjsSdk.SubpackageId(topLevelId)];
        if (subpackage != null) {
            assign(topLevelId, subpackage.name);
        }
    }
    return topLevelName;
}

function collectPackages(apiDefinition: ApiDefinition): { namespaceName?: string; endpoints: EndpointDefinition[] }[] {
    const topLevelName = buildTopLevelNameBySubpackageId(apiDefinition);
    const packages: { namespaceName?: string; endpoints: EndpointDefinition[] }[] = [
        { namespaceName: undefined, endpoints: apiDefinition.rootPackage.endpoints }
    ];
    for (const [subpackageId, subpackage] of Object.entries(apiDefinition.subpackages)) {
        // Scope endpoints by their TOP-LEVEL subpackage name (what the `namespaces` config maps),
        // falling back to the subpackage's own name for a flat (non-nested) API.
        packages.push({
            namespaceName: topLevelName.get(subpackageId) ?? subpackage.name,
            endpoints: subpackage.endpoints
        });
    }
    return packages;
}

function alreadyHasCliSnippet(example: FdrCjsSdk.api.v1.register.ExampleEndpointCall): boolean {
    return (example.codeSamples ?? []).some((sample) => sample.language === CLI_SNIPPET_LANGUAGE);
}

/**
 * Mutate an FDR {@link ApiDefinition} in place, injecting a `cli` code sample onto every endpoint
 * example whose endpoint matches a catalog command. Pure with respect to I/O (the catalog is already
 * loaded), so it is the unit under test. Returns a coverage count — the guard against a silent
 * path-reconstruction or wire-name regression reading as "done".
 */
export function injectCliSnippetsIntoApiDefinition({
    apiDefinition,
    catalog,
    namespaces,
    context
}: {
    apiDefinition: ApiDefinition;
    catalog: CliCatalog;
    namespaces?: Record<string, string>;
    context?: TaskContext;
}): CliSnippetInjectionStats {
    const index: CliCatalogIndex = buildCatalogIndex(catalog, context);
    const stats: CliSnippetInjectionStats = { totalEndpoints: 0, matchedEndpoints: 0, injectedSamples: 0 };

    for (const { namespaceName, endpoints } of collectPackages(apiDefinition)) {
        const mappedNamespace = namespaceName != null ? namespaces?.[namespaceName] : undefined;
        for (const endpoint of endpoints) {
            stats.totalEndpoints += 1;
            const path = reconstructOpenApiPath(endpoint.path);
            const command = index.lookup(endpoint.method, path, mappedNamespace);
            if (command == null) {
                continue;
            }
            stats.matchedEndpoints += 1;
            for (const example of endpoint.examples) {
                if (alreadyHasCliSnippet(example)) {
                    continue;
                }
                const code = assembleCliCommand(command, example);
                example.codeSamples = [
                    ...(example.codeSamples ?? []),
                    {
                        language: CLI_SNIPPET_LANGUAGE,
                        code,
                        name: undefined,
                        description: undefined,
                        install: undefined
                    }
                ];
                stats.injectedSamples += 1;
            }
        }
    }

    context?.logger.info(
        `CLI snippets: matched ${stats.matchedEndpoints}/${stats.totalEndpoints} endpoints, ` +
            `injected ${stats.injectedSamples} samples.`
    );
    if (stats.matchedEndpoints < stats.totalEndpoints) {
        context?.logger.warn(
            `CLI snippets: ${stats.totalEndpoints - stats.matchedEndpoints}/${stats.totalEndpoints} endpoints did ` +
                `not match a catalog command and will render without a CLI tab.`
        );
    }
    return stats;
}

/**
 * Publish-time entry point: load the committed catalog from {@link CliSnippetsConfig} and inject CLI
 * snippets into the API definition. Called from `registerApiToFdr` (publishDocs.ts) immediately after
 * `convertIrToFdrApi`, and from `buildLocaleApiDefinitions` (publishDocsLedger.ts) for translated
 * locales — both go through this shared helper so locale sites keep the tab.
 *
 * Failures are logged and swallowed: a broken or stale catalog must not fail the docs publish; the
 * endpoints simply ship without the CLI tab.
 */
export async function injectCliSnippets({
    apiDefinition,
    config,
    context
}: {
    apiDefinition: ApiDefinition;
    config: CliSnippetsConfig;
    context: TaskContext;
}): Promise<CliSnippetInjectionStats | undefined> {
    try {
        const catalog = await loadCliCatalog(config.catalogAbsolutePath);
        return injectCliSnippetsIntoApiDefinition({
            apiDefinition,
            catalog,
            namespaces: config.namespaces,
            context
        });
    } catch (error) {
        context.logger.warn(`Skipping CLI snippet injection: ${(error as Error).message}`);
        return undefined;
    }
}
