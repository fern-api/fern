import { FernIr } from "@fern-fern/ir-sdk";

import { formatEndpointPathForSwift } from "../format-endpoint-path-for-swift.js";

/**
 * Helper to build a minimal HttpEndpoint-like object for testing.
 * Only populates the fields that formatEndpointPathForSwift / parseEndpointPath actually read.
 *
 * For most cases, parts and allPathParameters are derived from the same input.
 * Use rawParts + rawAllPathParameters for edge cases where they need to differ
 * (e.g. missing path parameter declarations, null tails).
 */
function makeEndpoint(
    opts:
        | {
              head: string | undefined;
              parts?: Array<{
                  paramOriginalName: string;
                  paramCamelCase: string;
                  tail: string;
                  docs?: string;
              }>;
          }
        | {
              head: string | undefined;
              rawParts: Array<{ pathParameter: string; tail: string | undefined }>;
              rawAllPathParameters: Array<{
                  name: { originalName: string; camelCase: { unsafeName: string } };
                  docs: string | undefined;
              }>;
          }
): FernIr.HttpEndpoint {
    if ("rawParts" in opts) {
        return {
            fullPath: {
                head: opts.head,
                parts: opts.rawParts
            },
            allPathParameters: opts.rawAllPathParameters
        } as unknown as FernIr.HttpEndpoint;
    }
    const parts = opts.parts ?? [];
    return {
        fullPath: {
            head: opts.head,
            parts: parts.map((p) => ({
                pathParameter: p.paramOriginalName,
                tail: p.tail
            }))
        },
        allPathParameters: parts.map((p) => ({
            name: {
                originalName: p.paramOriginalName,
                camelCase: { unsafeName: p.paramCamelCase }
            },
            docs: p.docs
        }))
    } as unknown as FernIr.HttpEndpoint;
}

describe("formatEndpointPathForSwift", () => {
    // --- Basic path formatting ---

    it("formats a static path with no parameters", () => {
        const endpoint = makeEndpoint({ head: "/users" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/users");
    });

    it("formats a path with a single path parameter", () => {
        const endpoint = makeEndpoint({
            head: "/users/",
            parts: [{ paramOriginalName: "user_id", paramCamelCase: "userId", tail: "" }]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/users/\\(userId)");
    });

    it("formats a path with multiple path parameters", () => {
        const endpoint = makeEndpoint({
            head: "/organizations/",
            parts: [
                { paramOriginalName: "org_id", paramCamelCase: "orgId", tail: "/users/" },
                { paramOriginalName: "user_id", paramCamelCase: "userId", tail: "" }
            ]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/organizations/\\(orgId)/users/\\(userId)");
    });

    // --- Leading slash handling ---

    it("prepends a leading slash if missing", () => {
        const endpoint = makeEndpoint({ head: "users" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/users");
    });

    it("prepends a leading slash when head is missing and path parameter starts the path", () => {
        const endpoint = makeEndpoint({
            head: "",
            parts: [{ paramOriginalName: "id", paramCamelCase: "id", tail: "" }]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/\\(id)");
    });

    // --- Trailing slash handling ---

    it("strips a trailing slash", () => {
        const endpoint = makeEndpoint({ head: "/users/" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/users");
    });

    it("preserves a single slash as the root path", () => {
        const endpoint = makeEndpoint({ head: "/" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/");
    });

    it("strips trailing slash after path parameter tail", () => {
        const endpoint = makeEndpoint({
            head: "/",
            parts: [{ paramOriginalName: "id", paramCamelCase: "id", tail: "/details/" }]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/\\(id)/details");
    });

    // --- Empty / null head handling ---

    it("handles an empty head with no parts", () => {
        const endpoint = makeEndpoint({ head: "" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/");
    });

    it("skips null head and still formats path parts", () => {
        const endpoint = makeEndpoint({
            head: undefined,
            rawParts: [{ pathParameter: "id", tail: "/details" }],
            rawAllPathParameters: [{ name: { originalName: "id", camelCase: { unsafeName: "id" } }, docs: undefined }]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/\\(id)/details");
    });

    // --- Null tail handling ---

    it("skips null tail in path parts", () => {
        const endpoint = makeEndpoint({
            head: "/users/",
            rawParts: [{ pathParameter: "user_id", tail: undefined }],
            rawAllPathParameters: [
                { name: { originalName: "user_id", camelCase: { unsafeName: "userId" } }, docs: undefined }
            ]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/users/\\(userId)");
    });

    // --- Missing path parameter declaration ---

    it("skips path parameters not declared in allPathParameters but keeps surrounding literals", () => {
        const endpoint = makeEndpoint({
            head: "/items/",
            rawParts: [{ pathParameter: "unknown_param", tail: "/details" }],
            rawAllPathParameters: []
        });
        // The undeclared param is silently dropped; head trailing "/" and tail leading "/" remain
        expect(formatEndpointPathForSwift(endpoint)).toBe("/items//details");
    });

    // --- Consecutive path parameters ---

    it("handles consecutive path parameters with no separator", () => {
        const endpoint = makeEndpoint({
            head: "/",
            rawParts: [
                { pathParameter: "key", tail: "" },
                { pathParameter: "value", tail: "" }
            ],
            rawAllPathParameters: [
                { name: { originalName: "key", camelCase: { unsafeName: "key" } }, docs: undefined },
                { name: { originalName: "value", camelCase: { unsafeName: "value" } }, docs: undefined }
            ]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/\\(key)\\(value)");
    });

    // --- Tail after path parameter ---

    it("handles a path parameter followed by a tail segment", () => {
        const endpoint = makeEndpoint({
            head: "/",
            parts: [{ paramOriginalName: "id", paramCamelCase: "id", tail: "/details" }]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/\\(id)/details");
    });

    // --- Complex / deeply nested ---

    it("handles deeply nested paths with multiple segments and parameters", () => {
        const endpoint = makeEndpoint({
            head: "/api/v1/",
            parts: [
                { paramOriginalName: "tenant_id", paramCamelCase: "tenantId", tail: "/resources/" },
                { paramOriginalName: "resource_id", paramCamelCase: "resourceId", tail: "/actions/" },
                { paramOriginalName: "action_id", paramCamelCase: "actionId", tail: "" }
            ]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe(
            "/api/v1/\\(tenantId)/resources/\\(resourceId)/actions/\\(actionId)"
        );
    });
});
