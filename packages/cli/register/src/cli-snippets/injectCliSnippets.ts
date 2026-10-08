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

function collectPackages(apiDefinition: ApiDefinition): { namespaceName?: string; endpoints: EndpointDefinition[] }[] {
    const packages: { namespaceName?: string; endpoints: EndpointDefinition[] }[] = [
        { namespaceName: undefined, endpoints: apiDefinition.rootPackage.endpoints }
    ];
    for (const subpackage of Object.values(apiDefinition.subpackages)) {
        packages.push({ namespaceName: subpackage.name, endpoints: subpackage.endpoints });
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

    context?.logger.debug(
        `CLI snippets: matched ${stats.matchedEndpoints}/${stats.totalEndpoints} endpoints, ` +
            `injected ${stats.injectedSamples} samples.`
    );
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
