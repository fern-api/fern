import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as FernGeneratorExecSerializers from "@fern-fern/generator-exec-sdk/serialization";
import { describe, expect, it } from "vitest";

import { serializeEndpointSnippetsForWire } from "../serializeEndpointSnippetsForWire.js";

// These fixtures pin our hand-rolled serializer to Zurg's output. If
// FernGeneratorExec.Endpoint, EndpointIdentifier, or any per-language
// EndpointSnippet variant gains a new field, Zurg will surface it in
// `expected` and our manual `actual` will diverge — that's the regression
// signal we want.

function path(value: string): FernGeneratorExec.EndpointPath {
    return FernGeneratorExec.EndpointPath(value);
}

function makeTypescriptSnippet(
    overrides: Partial<FernGeneratorExec.TypescriptEndpointSnippet> = {}
): FernGeneratorExec.EndpointSnippet {
    return FernGeneratorExec.EndpointSnippet.typescript({
        client: "await client.users.list();",
        ...overrides
    });
}

function makeEndpoint(overrides: Partial<FernGeneratorExec.Endpoint> = {}): FernGeneratorExec.Endpoint {
    return {
        id: {
            path: path("/users"),
            method: FernGeneratorExec.EndpointMethod.Get
        },
        snippet: makeTypescriptSnippet(),
        ...overrides
    };
}

async function zurgSerialize(endpoints: FernGeneratorExec.Endpoint[]): Promise<unknown> {
    return FernGeneratorExecSerializers.Snippets.jsonOrThrow({ types: {}, endpoints });
}

describe("serializeEndpointSnippetsForWire", () => {
    it("matches Zurg for an empty endpoint list", async () => {
        const expected = await zurgSerialize([]);
        const actual = serializeEndpointSnippetsForWire([]);
        expect(actual).toStrictEqual(expected);
    });

    it("matches Zurg for a single typescript endpoint without optional fields", async () => {
        const endpoints = [makeEndpoint()];
        const expected = await zurgSerialize(endpoints);
        const actual = serializeEndpointSnippetsForWire(endpoints);
        expect(actual).toStrictEqual(expected);
    });

    it("renames identifierOverride → identifier_override", async () => {
        const endpoints = [
            makeEndpoint({
                id: {
                    path: path("/users/{id}"),
                    method: FernGeneratorExec.EndpointMethod.Get,
                    identifierOverride: "endpoint_users_get"
                }
            })
        ];
        const expected = await zurgSerialize(endpoints);
        const actual = serializeEndpointSnippetsForWire(endpoints);
        expect(actual).toStrictEqual(expected);
        expect(JSON.stringify(actual)).toContain("identifier_override");
        expect(JSON.stringify(actual)).not.toContain("identifierOverride");
    });

    it("renames exampleIdentifier → example_identifier", async () => {
        const endpoints = [makeEndpoint({ exampleIdentifier: "users-list-default" })];
        const expected = await zurgSerialize(endpoints);
        const actual = serializeEndpointSnippetsForWire(endpoints);
        expect(actual).toStrictEqual(expected);
        expect(JSON.stringify(actual)).toContain("example_identifier");
        expect(JSON.stringify(actual)).not.toContain("exampleIdentifier");
    });

    it("matches Zurg when both identifierOverride and exampleIdentifier are present", async () => {
        const endpoints = [
            makeEndpoint({
                id: {
                    path: path("/users/{id}"),
                    method: FernGeneratorExec.EndpointMethod.Patch,
                    identifierOverride: "endpoint_users_patch"
                },
                exampleIdentifier: "users-patch-default"
            })
        ];
        const expected = await zurgSerialize(endpoints);
        const actual = serializeEndpointSnippetsForWire(endpoints);
        expect(actual).toStrictEqual(expected);
    });

    it("matches Zurg across every per-language EndpointSnippet variant", async () => {
        const client = "fake client snippet";
        const variants: FernGeneratorExec.EndpointSnippet[] = [
            FernGeneratorExec.EndpointSnippet.typescript({ client }),
            FernGeneratorExec.EndpointSnippet.python({ syncClient: client, asyncClient: client }),
            FernGeneratorExec.EndpointSnippet.java({ syncClient: client, asyncClient: client }),
            FernGeneratorExec.EndpointSnippet.go({ client }),
            FernGeneratorExec.EndpointSnippet.ruby({ client }),
            FernGeneratorExec.EndpointSnippet.csharp({ client }),
            FernGeneratorExec.EndpointSnippet.rust({ client })
        ];
        const endpoints = variants.map((snippet, i) =>
            makeEndpoint({
                id: {
                    path: path(`/v${i}`),
                    method: FernGeneratorExec.EndpointMethod.Get
                },
                snippet
            })
        );
        const expected = await zurgSerialize(endpoints);
        const actual = serializeEndpointSnippetsForWire(endpoints);
        expect(actual).toStrictEqual(expected);
    });

    it("preserves a stable insertion order across many endpoints", async () => {
        const endpoints = Array.from({ length: 8 }, (_, i) =>
            makeEndpoint({
                id: {
                    path: path(`/path-${i}`),
                    method: FernGeneratorExec.EndpointMethod.Post,
                    identifierOverride: `endpoint_${i}`
                },
                exampleIdentifier: `ex-${i}`
            })
        );
        const expected = await zurgSerialize(endpoints);
        const actual = serializeEndpointSnippetsForWire(endpoints);
        expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
    });
});
