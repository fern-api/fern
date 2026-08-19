import { noop } from "lodash-es";
import { describe, expect, it } from "vitest";

import { findMatchingSpecPath, mergeExamplesIntoSpec } from "../mergeOpenAPIWithOverrides.js";

function createMockContext() {
    return {
        logger: {
            disable: noop,
            enable: noop,
            trace: noop,
            debug: noop,
            info: noop,
            warn: noop,
            error: noop,
            log: noop
        }
    };
}

describe("findMatchingSpecPath", () => {
    it("returns exact match when available", () => {
        const specPaths = { "/users/{username}": {}, "/orders": {} };
        expect(findMatchingSpecPath("/users/{username}", specPaths)).toBe("/users/{username}");
    });

    it("matches bare param name to templated path", () => {
        const specPaths = { "/users/{username}": {}, "/orders": {} };
        expect(findMatchingSpecPath("/users/username", specPaths)).toBe("/users/{username}");
    });

    it("matches multiple param segments", () => {
        const specPaths = { "/customers/{customerId}/orders/{orderId}": {} };
        expect(findMatchingSpecPath("/customers/customerId/orders/orderId", specPaths)).toBe(
            "/customers/{customerId}/orders/{orderId}"
        );
    });

    it("returns undefined for non-matching paths", () => {
        const specPaths = { "/users/{username}": {} };
        expect(findMatchingSpecPath("/products/productId", specPaths)).toBeUndefined();
    });

    it("returns undefined when segment count differs", () => {
        const specPaths = { "/users/{username}/profile": {} };
        expect(findMatchingSpecPath("/users/username", specPaths)).toBeUndefined();
    });
});

describe("mergeExamplesIntoSpec", () => {
    const context = createMockContext();

    it("decomposes path parameter examples into native fields", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/users/{username}": {
                    get: {
                        parameters: [{ name: "username", in: "path", required: true, schema: { type: "string" } }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const overrides = {
            paths: {
                "/users/username": {
                    get: {
                        "x-fern-examples": [
                            {
                                "path-parameters": { username: "john_doe" }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        expect(result.paths["/users/{username}"].get.parameters[0].example).toBe("john_doe");
    });

    it("decomposes query parameter examples into native fields", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/users": {
                    get: {
                        parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const overrides = {
            paths: {
                "/users": {
                    get: {
                        "x-fern-examples": [
                            {
                                "query-parameters": { limit: 10 }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        expect(result.paths["/users"].get.parameters[0].example).toBe(10);
    });

    it("decomposes header examples into native fields", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/users": {
                    get: {
                        parameters: [{ name: "X-Request-Id", in: "header", schema: { type: "string" } }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const overrides = {
            paths: {
                "/users": {
                    get: {
                        "x-fern-examples": [
                            {
                                headers: { "X-Request-Id": "req-abc-123" }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        expect(result.paths["/users"].get.parameters[0].example).toBe("req-abc-123");
    });

    it("decomposes request body examples into native fields", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/users": {
                    post: {
                        requestBody: {
                            content: { "application/json": { schema: { type: "object" } } }
                        },
                        responses: { "201": { description: "Created" } }
                    }
                }
            }
        };
        const overrides = {
            paths: {
                "/users": {
                    post: {
                        "x-fern-examples": [
                            {
                                request: { body: { name: "John", email: "john@example.com" } }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        expect(result.paths["/users"].post.requestBody.content["application/json"].example).toEqual({
            name: "John",
            email: "john@example.com"
        });
    });

    it("decomposes response body examples into native fields", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/users/{username}": {
                    get: {
                        parameters: [{ name: "username", in: "path", required: true, schema: { type: "string" } }],
                        responses: {
                            "200": {
                                description: "OK",
                                content: {
                                    "application/json": {
                                        schema: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        const overrides = {
            paths: {
                "/users/username": {
                    get: {
                        "x-fern-examples": [
                            {
                                response: { body: { id: 1, username: "john_doe", email: "john@example.com" } }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        expect(result.paths["/users/{username}"].get.responses["200"].content["application/json"].example).toEqual({
            id: 1,
            username: "john_doe",
            email: "john@example.com"
        });
    });

    it("strips x-fern-examples from output", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/users": {
                    get: {
                        parameters: [],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const overrides = {
            paths: {
                "/users": {
                    get: {
                        "x-fern-examples": [{ response: { body: { id: 1 } } }]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        expect(result.paths["/users"].get["x-fern-examples"]).toBeUndefined();
    });

    it("preserves full spec structure after merge", () => {
        const spec = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            servers: [{ url: "https://api.example.com" }],
            paths: {
                "/health": {
                    get: { responses: { "200": { description: "OK" } } }
                }
            },
            components: {
                schemas: {
                    User: { type: "object", properties: { id: { type: "integer" } } }
                }
            }
        };
        const overrides = { paths: {} };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        expect(result.openapi).toBe("3.1.0");
        expect(result.info).toEqual({ title: "Test API", version: "1.0.0" });
        expect(result.servers).toEqual([{ url: "https://api.example.com" }]);
        expect(result.components.schemas.User).toBeDefined();
    });

    it("handles multiple examples with named entries", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/users/{username}": {
                    get: {
                        parameters: [{ name: "username", in: "path", required: true, schema: { type: "string" } }],
                        responses: {
                            "200": {
                                description: "OK",
                                content: { "application/json": { schema: { type: "object" } } }
                            }
                        }
                    }
                }
            }
        };
        const overrides = {
            paths: {
                "/users/username": {
                    get: {
                        "x-fern-examples": [
                            {
                                name: "admin",
                                "path-parameters": { username: "admin_user" },
                                response: { body: { id: 1, username: "admin_user" } }
                            },
                            {
                                name: "regular",
                                "path-parameters": { username: "regular_user" },
                                response: { body: { id: 2, username: "regular_user" } }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        const param = result.paths["/users/{username}"].get.parameters[0];
        expect(param.examples.admin.value).toBe("admin_user");
        expect(param.examples.regular.value).toBe("regular_user");

        const responseContent = result.paths["/users/{username}"].get.responses["200"].content["application/json"];
        expect(responseContent.examples.admin.value).toEqual({ id: 1, username: "admin_user" });
        expect(responseContent.examples.regular.value).toEqual({ id: 2, username: "regular_user" });
    });

    it("resolves $ref parameters before applying examples", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/orders/{orderId}": {
                    get: {
                        parameters: [{ $ref: "#/components/parameters/OrderId" }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            },
            components: {
                parameters: {
                    OrderId: { name: "orderId", in: "path", required: true, schema: { type: "string" } }
                }
            }
        };
        const overrides = {
            paths: {
                "/orders/orderId": {
                    get: {
                        "x-fern-examples": [
                            {
                                "path-parameters": { orderId: "ORD-12345" }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        expect(result.paths["/orders/{orderId}"].get.parameters[0].example).toBe("ORD-12345");
        expect(result.paths["/orders/{orderId}"].get.parameters[0].name).toBe("orderId");
    });

    it("handles all example types in a single operation", () => {
        const spec = {
            openapi: "3.1.0",
            paths: {
                "/customers/{customerId}": {
                    put: {
                        parameters: [
                            { name: "customerId", in: "path", required: true, schema: { type: "string" } },
                            { name: "include_audit", in: "query", schema: { type: "boolean" } },
                            { name: "X-Idempotency-Key", in: "header", schema: { type: "string" } }
                        ],
                        requestBody: {
                            content: { "application/json": { schema: { type: "object" } } }
                        },
                        responses: {
                            "200": {
                                description: "OK",
                                content: { "application/json": { schema: { type: "object" } } }
                            }
                        }
                    }
                }
            }
        };
        const overrides = {
            paths: {
                "/customers/customerId": {
                    put: {
                        "x-fern-examples": [
                            {
                                "path-parameters": { customerId: "cust-999" },
                                "query-parameters": { include_audit: true },
                                headers: { "X-Idempotency-Key": "key-abc" },
                                request: { body: { name: "Acme Corp", email: "acme@example.com" } },
                                response: { body: { id: "cust-999", name: "Acme Corp", status: "updated" } }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, context);
        const op = result.paths["/customers/{customerId}"].put;

        // Path param
        expect(op.parameters[0].example).toBe("cust-999");
        // Query param
        expect(op.parameters[1].example).toBe(true);
        // Header
        expect(op.parameters[2].example).toBe("key-abc");
        // Request body
        expect(op.requestBody.content["application/json"].example).toEqual({
            name: "Acme Corp",
            email: "acme@example.com"
        });
        // Response body
        expect(op.responses["200"].content["application/json"].example).toEqual({
            id: "cust-999",
            name: "Acme Corp",
            status: "updated"
        });
        // No x-fern-examples
        expect(op["x-fern-examples"]).toBeUndefined();
    });
});
