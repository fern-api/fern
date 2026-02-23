import { FernIr } from "@fern-fern/ir-sdk";

import { formatEndpointPathForSwift } from "../format-endpoint-path-for-swift.js";

/**
 * Helper to build a minimal HttpEndpoint-like object for testing.
 * Only populates the fields that formatEndpointPathForSwift / parseEndpointPath actually read.
 */
function makeEndpoint(opts: {
    head: string;
    parts?: Array<{ paramOriginalName: string; paramCamelCase: string; tail: string; docs?: string }>;
}): FernIr.HttpEndpoint {
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

    it("prepends a leading slash if missing", () => {
        const endpoint = makeEndpoint({ head: "users" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/users");
    });

    it("strips a trailing slash", () => {
        const endpoint = makeEndpoint({ head: "/users/" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/users");
    });

    it("preserves a single slash as the root path", () => {
        const endpoint = makeEndpoint({ head: "/" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/");
    });

    it("handles an empty head with no parts", () => {
        const endpoint = makeEndpoint({ head: "" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/");
    });

    it("handles an empty head with a path parameter", () => {
        const endpoint = makeEndpoint({
            head: "",
            parts: [{ paramOriginalName: "id", paramCamelCase: "id", tail: "" }]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/\\(id)");
    });

    it("handles a path parameter followed by a tail segment", () => {
        const endpoint = makeEndpoint({
            head: "/",
            parts: [{ paramOriginalName: "id", paramCamelCase: "id", tail: "/details" }]
        });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/\\(id)/details");
    });

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
