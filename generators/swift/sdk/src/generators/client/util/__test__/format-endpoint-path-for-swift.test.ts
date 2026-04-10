import { formatEndpointPathForSwift } from "../format-endpoint-path-for-swift.js";
import { EndpointPathInput } from "../parse-endpoint-path.js";

function makeEndpoint(opts: {
    head: string;
    parts?: Array<{
        paramOriginalName: string;
        paramCamelCase: string;
        tail: string;
    }>;
}): EndpointPathInput {
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
            docs: undefined
        }))
    };
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

    it("prepends a leading slash when head is empty and path parameter starts the path", () => {
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

    // --- Empty head handling ---

    it("handles an empty head with no parts", () => {
        const endpoint = makeEndpoint({ head: "" });
        expect(formatEndpointPathForSwift(endpoint)).toBe("/");
    });

    // --- Missing path parameter declaration ---

    it("skips path parameters not declared in allPathParameters but keeps surrounding literals", () => {
        const endpoint: EndpointPathInput = {
            fullPath: {
                head: "/items/",
                parts: [{ pathParameter: "unknown_param", tail: "/details" }]
            },
            allPathParameters: []
        };
        expect(formatEndpointPathForSwift(endpoint)).toBe("/items//details");
    });

    // --- Consecutive path parameters ---

    it("handles consecutive path parameters with no separator", () => {
        const endpoint = makeEndpoint({
            head: "/",
            parts: [
                { paramOriginalName: "key", paramCamelCase: "key", tail: "" },
                { paramOriginalName: "value", paramCamelCase: "value", tail: "" }
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
