import { isNonNullish } from "@fern-api/core-utils";
import { FdrAPI } from "@fern-api/fdr-sdk";

export const mergeApiExamples = (
    fernApi: FdrAPI.api.v1.read.ApiDefinition,
    api: FdrAPI.api.latest.ApiDefinition
): void => {
    const createSnippet = (
        example: FdrAPI.api.v1.read.ExampleEndpointCall,
        language: FdrAPI.api.latest.Language,
        code?: string,
        install?: string
    ): FdrAPI.api.latest.CodeSnippet[] | undefined =>
        code ? [{ name: example.name, language, code, generated: true, install, description: undefined }] : undefined;

    const createSnippetsForExample = (example: FdrAPI.api.v1.read.ExampleEndpointCall) => ({
        go:
            example.codeExamples.goSdk &&
            createSnippet(example, "go", example.codeExamples.goSdk.client, example.codeExamples.goSdk.install),
        pythonAsync:
            example.codeExamples.pythonSdk &&
            createSnippet(
                example,
                "python",
                example.codeExamples.pythonSdk.async_client,
                example.codeExamples.pythonSdk.install
            ),
        pythonSync:
            example.codeExamples.pythonSdk &&
            createSnippet(
                example,
                "python",
                example.codeExamples.pythonSdk.sync_client,
                example.codeExamples.pythonSdk.install
            ),
        node: example.codeExamples.nodeAxios
            ? createSnippet(example, "node", example.codeExamples.nodeAxios)
            : undefined,
        ruby:
            example.codeExamples.rubySdk &&
            createSnippet(example, "ruby", example.codeExamples.rubySdk.client, example.codeExamples.rubySdk.install),
        typescript:
            example.codeExamples.typescriptSdk &&
            createSnippet(
                example,
                "typescript",
                example.codeExamples.typescriptSdk.client,
                example.codeExamples.typescriptSdk.install
            )
    });

    const mergeSnippets = (
        existing: Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[]>,
        snippets: Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[] | undefined>
    ): Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[]> => ({
        ...existing,
        ...(snippets.go && { go: [...(existing.go ?? []), ...(snippets.go ?? [])].filter(isNonNullish) }),
        ...((snippets.pythonAsync || snippets.pythonSync) && {
            python: [
                ...(existing.python ?? []),
                ...(snippets.pythonAsync ?? []),
                ...(snippets.pythonSync ?? [])
            ].filter(isNonNullish)
        }),
        ...(snippets.node && {
            node: [...(existing.node ?? []), ...(snippets.node ?? [])].filter(isNonNullish)
        }),
        ...(snippets.ruby && {
            ruby: [...(existing.ruby ?? []), ...(snippets.ruby ?? [])].filter(isNonNullish)
        }),
        ...(snippets.typescript && {
            typescript: [...(existing.typescript ?? []), ...(snippets.typescript ?? [])].filter(isNonNullish)
        })
    });

    const createInitialSnippets = (
        snippets: Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[] | undefined>
    ): Record<FdrAPI.api.latest.Language, FdrAPI.api.latest.CodeSnippet[]> => ({
        ...(snippets.go && { go: snippets.go }),
        ...((snippets.pythonAsync || snippets.pythonSync) && {
            python: [...(snippets.pythonAsync ?? []), ...(snippets.pythonSync ?? [])].filter(isNonNullish)
        }),
        ...(snippets.node && { node: snippets.node }),
        ...(snippets.ruby && { ruby: snippets.ruby }),
        ...(snippets.typescript && { typescript: snippets.typescript })
    });

    Object.values({ _: fernApi.rootPackage, ...fernApi.subpackages }).forEach((package_) =>
        package_.endpoints.forEach((fernEndpoint) => {
            const matchingOpenApiEndpoint = Object.values(api.endpoints).find(
                (openApiEndpoint) =>
                    openApiEndpoint.method === fernEndpoint.method &&
                    openApiEndpoint.path.join("/") === fernEndpoint.path.parts.join("/")
            );

            if (matchingOpenApiEndpoint) {
                fernEndpoint.examples.forEach((fernExample) => {
                    const matchingOpenApiExample = matchingOpenApiEndpoint.examples?.find(
                        (e) => e.name === fernExample.name
                    );

                    if (matchingOpenApiExample) {
                        const snippets = createSnippetsForExample(fernExample);
                        matchingOpenApiExample.snippets = matchingOpenApiExample.snippets
                            ? mergeSnippets(matchingOpenApiExample.snippets, snippets)
                            : createInitialSnippets(snippets);
                    }
                });
            }
        })
    );
};
