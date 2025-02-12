import { isNonNullish } from "@fern-api/core-utils";
import { FdrAPI } from "@fern-api/fdr-sdk";

/**
 * Merges code examples from a Fern API definition into an OpenAPI definition.
 * This allows us to combine SDK code examples with OpenAPI examples.
 */
export function mergeApiExamples(
    fernApi: FdrAPI.api.v1.read.ApiDefinition,
    api: FdrAPI.api.latest.ApiDefinition
): void {
    // Process all packages and their endpoints
    Object.values({ _: fernApi.rootPackage, ...fernApi.subpackages }).forEach((package_) => {
        package_.endpoints.forEach((fernEndpoint) => {
            // Find matching OpenAPI endpoint by method and path
            const matchingOpenApiEndpoint = Object.values(api.endpoints).find(
                (openApiEndpoint) =>
                    openApiEndpoint.method === fernEndpoint.method &&
                    openApiEndpoint.path.map((p) => p.value).join("") ===
                        fernEndpoint.path.parts.map((p) => p.value).join("")
            );

            if (matchingOpenApiEndpoint) {
                // Process each example in the Fern endpoint
                fernEndpoint.examples.forEach((fernExample) => {
                    const matchingOpenApiExample = matchingOpenApiEndpoint.examples?.find(
                        (e) => e.name === fernExample.name
                    );

                    if (matchingOpenApiExample) {
                        // Create and merge snippets
                        const snippets = createSnippetsForExample(fernExample);
                        matchingOpenApiExample.snippets =
                            matchingOpenApiExample.snippets != null
                                ? mergeSnippets(matchingOpenApiExample.snippets, snippets)
                                : createInitialSnippets(snippets);
                    }
                });
            }
        });
    });
}

/**
 * Creates a code snippet for a given example and language
 */
const createSnippet = (
    example: FdrAPI.api.v1.read.ExampleEndpointCall,
    language: FdrAPI.api.latest.Language,
    code?: string,
    install?: string
): FdrAPI.api.latest.CodeSnippet[] | undefined => {
    if (!code) {
        return undefined;
    }
    return [
        {
            name: example.name,
            language,
            code,
            generated: true,
            install,
            description: undefined
        }
    ];
};

/**
 * Creates initial snippets object from new snippets
 */
function createInitialSnippets(
    snippets: Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[] | undefined>
): Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[]> {
    const initial: Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[]> = {};
    if (snippets.go) {
        initial.go = snippets.go;
    }
    if (snippets.pythonAsync || snippets.pythonSync) {
        initial.python = [...(snippets.pythonAsync ?? []), ...(snippets.pythonSync ?? [])].filter(isNonNullish);
    }
    if (snippets.node) {
        initial.node = snippets.node;
    }
    if (snippets.ruby) {
        initial.ruby = snippets.ruby;
    }
    if (snippets.typescript) {
        initial.typescript = snippets.typescript;
    }
    return initial;
}

/**
 * Merges new snippets into existing snippets, preserving both
 */
function mergeSnippets(
    existing: Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[]>,
    snippets: Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[] | undefined>
): Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[]> {
    const merged = {
        ...existing
    };
    if (snippets.go) {
        merged.go = [...(existing.go ?? []), ...snippets.go].filter(isNonNullish);
    }
    if (snippets.pythonAsync || snippets.pythonSync) {
        merged.python = [
            ...(existing.python ?? []),
            ...(snippets.pythonAsync ?? []),
            ...(snippets.pythonSync ?? [])
        ].filter(isNonNullish);
    }
    if (snippets.node) {
        merged.node = [...(existing.node ?? []), ...snippets.node].filter(isNonNullish);
    }
    if (snippets.ruby) {
        merged.ruby = [...(existing.ruby ?? []), ...snippets.ruby].filter(isNonNullish);
    }
    if (snippets.typescript) {
        merged.typescript = [...(existing.typescript ?? []), ...snippets.typescript].filter(isNonNullish);
    }
    return merged;
}

/**
 * Creates code snippets for all supported languages from a Fern example
 */
function createSnippetsForExample(example: FdrAPI.api.v1.read.ExampleEndpointCall) {
    return {
        // Go examples
        go:
            example.codeExamples.goSdk &&
            createSnippet(example, "go", example.codeExamples.goSdk.client, example.codeExamples.goSdk.install),

        // Python async examples
        pythonAsync:
            example.codeExamples.pythonSdk &&
            createSnippet(
                example,
                "python",
                example.codeExamples.pythonSdk.async_client,
                example.codeExamples.pythonSdk.install
            ),

        // Python sync examples
        pythonSync:
            example.codeExamples.pythonSdk &&
            createSnippet(
                example,
                "python",
                example.codeExamples.pythonSdk.sync_client,
                example.codeExamples.pythonSdk.install
            ),

        // Node examples
        node: example.codeExamples.nodeAxios
            ? createSnippet(example, "node", example.codeExamples.nodeAxios)
            : undefined,

        // Ruby examples
        ruby:
            example.codeExamples.rubySdk &&
            createSnippet(example, "ruby", example.codeExamples.rubySdk.client, example.codeExamples.rubySdk.install),

        // TypeScript examples
        typescript:
            example.codeExamples.typescriptSdk &&
            createSnippet(
                example,
                "typescript",
                example.codeExamples.typescriptSdk.client,
                example.codeExamples.typescriptSdk.install
            )
    };
}
