import { assertNever } from "@fern-api/core-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

/**
 * Hand-rolled wire serializer for the snippets payload, used in place of
 * `FernGeneratorExecSerializers.Snippets.jsonOrThrow` to avoid Zurg's recursive
 * async validation overhead on hot codegen paths.
 *
 * MUST stay in lockstep with `FernGeneratorExec.Snippets` from
 * `@fern-fern/generator-exec-sdk`. Any new field on `Endpoint`,
 * `EndpointIdentifier`, or any per-language `EndpointSnippet` variant has to be
 * mirrored here. The `__test__/serializeEndpointSnippetsForWire.test.ts` test
 * pins this output to Zurg's serializer for representative fixtures.
 *
 * camelCase → snake_case renames currently applied:
 *   - Endpoint:           exampleIdentifier → example_identifier
 *   - EndpointIdentifier: identifierOverride → identifier_override
 *   - PythonEndpointSnippet / JavaEndpointSnippet:
 *                         syncClient → sync_client, asyncClient → async_client
 *
 * Adding a new EndpointSnippet variant will fail the `assertNever` exhaustive
 * switch, so the breakage is loud rather than silent.
 */
export function serializeEndpointSnippetsForWire(endpoints: FernGeneratorExec.Endpoint[]): {
    types: Record<string, never>;
    endpoints: Array<Record<string, unknown>>;
} {
    const serializedEndpoints = endpoints.map((endpoint) => {
        const entry: Record<string, unknown> = {
            id: {
                path: endpoint.id.path,
                method: endpoint.id.method,
                ...(endpoint.id.identifierOverride != null
                    ? { identifier_override: endpoint.id.identifierOverride }
                    : {})
            },
            snippet: serializeSnippet(endpoint.snippet)
        };
        if (endpoint.exampleIdentifier != null) {
            entry.example_identifier = endpoint.exampleIdentifier;
        }
        return entry;
    });
    return { types: {}, endpoints: serializedEndpoints };
}

function serializeSnippet(snippet: FernGeneratorExec.EndpointSnippet): Record<string, unknown> {
    switch (snippet.type) {
        case "typescript":
            return { type: "typescript", client: snippet.client };
        case "python":
            return { type: "python", sync_client: snippet.syncClient, async_client: snippet.asyncClient };
        case "java":
            return { type: "java", sync_client: snippet.syncClient, async_client: snippet.asyncClient };
        case "go":
            return { type: "go", client: snippet.client };
        case "ruby":
            return { type: "ruby", client: snippet.client };
        case "csharp":
            return { type: "csharp", client: snippet.client };
        case "rust":
            return { type: "rust", client: snippet.client };
        default:
            assertNever(snippet);
    }
}
