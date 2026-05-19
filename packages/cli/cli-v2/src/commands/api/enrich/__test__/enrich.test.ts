import { describe, expect, it } from "vitest";

import { extractEnrichedExamples, findMatchingSpecPath, mergeExamplesIntoSpec } from "../mergeExamples.js";

// biome-ignore lint/suspicious/noExplicitAny: test data
type Spec = Record<string, any>;

function createLogger() {
    const warnings: string[] = [];
    return {
        warn: (msg: string) => warnings.push(msg),
        warnings
    };
}

describe("findMatchingSpecPath", () => {
    it("returns exact match", () => {
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
    it("decomposes path parameter examples", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: {
                "/plants/{plantId}": {
                    get: {
                        parameters: [{ name: "plantId", in: "path", required: true, schema: { type: "string" } }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const overrides: Spec = {
            paths: {
                "/plants/plantId": {
                    get: {
                        "x-fern-examples": [{ "path-parameters": { plantId: "fern-001" } }]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, createLogger());
        expect(result.paths["/plants/{plantId}"].get.parameters[0].example).toBe("fern-001");
    });

    it("decomposes query parameter examples", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: {
                "/plants": {
                    get: {
                        parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const overrides: Spec = {
            paths: {
                "/plants": {
                    get: { "x-fern-examples": [{ "query-parameters": { limit: 10 } }] }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, createLogger());
        expect(result.paths["/plants"].get.parameters[0].example).toBe(10);
    });

    it("decomposes header examples", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: {
                "/plants": {
                    get: {
                        parameters: [{ name: "X-Request-Id", in: "header", schema: { type: "string" } }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const overrides: Spec = {
            paths: {
                "/plants": {
                    get: { "x-fern-examples": [{ headers: { "X-Request-Id": "req-abc-123" } }] }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, createLogger());
        expect(result.paths["/plants"].get.parameters[0].example).toBe("req-abc-123");
    });

    it("decomposes request body examples", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: {
                "/plants": {
                    post: {
                        requestBody: {
                            content: { "application/json": { schema: { type: "object" } } }
                        },
                        responses: { "201": { description: "Created" } }
                    }
                }
            }
        };
        const overrides: Spec = {
            paths: {
                "/plants": {
                    post: {
                        "x-fern-examples": [{ request: { body: { name: "Fiddle Leaf Fig", height: 120 } } }]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, createLogger());
        expect(result.paths["/plants"].post.requestBody.content["application/json"].example).toEqual({
            name: "Fiddle Leaf Fig",
            height: 120
        });
    });

    it("decomposes response body examples", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: {
                "/plants/{plantId}": {
                    get: {
                        parameters: [{ name: "plantId", in: "path", required: true, schema: { type: "string" } }],
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
        const overrides: Spec = {
            paths: {
                "/plants/{plantId}": {
                    get: {
                        "x-fern-examples": [{ response: { body: { id: "fern-001", name: "Monstera" } } }]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, createLogger());
        expect(result.paths["/plants/{plantId}"].get.responses["200"].content["application/json"].example).toEqual({
            id: "fern-001",
            name: "Monstera"
        });
    });

    it("uses named examples for multiple x-fern-examples", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: {
                "/plants": {
                    get: {
                        parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }],
                        responses: {
                            "200": {
                                description: "OK",
                                content: { "application/json": { schema: { type: "array" } } }
                            }
                        }
                    }
                }
            }
        };
        const overrides: Spec = {
            paths: {
                "/plants": {
                    get: {
                        "x-fern-examples": [
                            {
                                name: "SmallPage",
                                "query-parameters": { limit: 5 },
                                response: { body: [{ name: "Fern" }] }
                            },
                            {
                                name: "LargePage",
                                "query-parameters": { limit: 50 },
                                response: { body: [{ name: "Fern" }, { name: "Ivy" }] }
                            }
                        ]
                    }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, createLogger());
        const param = result.paths["/plants"].get.parameters[0];
        expect(param.examples.SmallPage).toEqual({ value: 5 });
        expect(param.examples.LargePage).toEqual({ value: 50 });

        const respContent = result.paths["/plants"].get.responses["200"].content["application/json"];
        expect(respContent.examples.SmallPage).toEqual({ value: [{ name: "Fern" }] });
        expect(respContent.examples.LargePage).toEqual({ value: [{ name: "Fern" }, { name: "Ivy" }] });
    });

    it("strips x-fern-examples from merged output", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: {
                "/plants": {
                    get: {
                        "x-fern-examples": [{ "query-parameters": { limit: 10 } }],
                        parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const overrides: Spec = {
            paths: {
                "/plants": {
                    get: { "x-fern-examples": [{ "query-parameters": { limit: 10 } }] }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, createLogger());
        expect(result.paths["/plants"].get["x-fern-examples"]).toBeUndefined();
    });

    it("warns and skips unmatched paths", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: { "/plants": { get: { responses: { "200": { description: "OK" } } } } }
        };
        const overrides: Spec = {
            paths: {
                "/unknown": { get: { "x-fern-examples": [{ "query-parameters": { q: "test" } }] } }
            }
        };

        const logger = createLogger();
        mergeExamplesIntoSpec(spec, overrides, logger);
        expect(logger.warnings).toHaveLength(1);
        expect(logger.warnings[0]).toContain("/unknown");
    });

    it("resolves $ref parameters before applying examples", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: {
                "/plants/{plantId}": {
                    get: {
                        parameters: [{ $ref: "#/components/parameters/PlantId" }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            },
            components: {
                parameters: {
                    PlantId: { name: "plantId", in: "path", required: true, schema: { type: "string" } }
                }
            }
        };
        const overrides: Spec = {
            paths: {
                "/plants/plantId": {
                    get: { "x-fern-examples": [{ "path-parameters": { plantId: "fern-042" } }] }
                }
            }
        };

        const result = mergeExamplesIntoSpec(spec, overrides, createLogger());
        expect(result.paths["/plants/{plantId}"].get.parameters[0].example).toBe("fern-042");
        expect(result.paths["/plants/{plantId}"].get.parameters[0].name).toBe("plantId");
    });

    it("returns spec unchanged when overrides have no paths", () => {
        const spec: Spec = {
            openapi: "3.1.0",
            paths: { "/plants": { get: { responses: { "200": { description: "OK" } } } } }
        };

        const result = mergeExamplesIntoSpec(spec, {}, createLogger());
        expect(result).toEqual(spec);
    });
});

describe("extractEnrichedExamples", () => {
    it("extracts parameter examples that were added", () => {
        const original: Spec = {
            paths: {
                "/plants/{plantId}": {
                    get: {
                        parameters: [{ name: "plantId", in: "path", required: true, schema: { type: "string" } }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const enriched: Spec = {
            paths: {
                "/plants/{plantId}": {
                    get: {
                        parameters: [
                            {
                                name: "plantId",
                                in: "path",
                                required: true,
                                schema: { type: "string" },
                                example: "fern-001"
                            }
                        ],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };

        const examples = extractEnrichedExamples(original, enriched);
        expect(examples.paths["/plants/{plantId}"].get.parameters).toEqual([
            { name: "plantId", in: "path", example: "fern-001" }
        ]);
    });

    it("extracts request body examples that were added", () => {
        const original: Spec = {
            paths: {
                "/plants": {
                    post: {
                        requestBody: { content: { "application/json": { schema: { type: "object" } } } },
                        responses: { "201": { description: "Created" } }
                    }
                }
            }
        };
        const enriched: Spec = {
            paths: {
                "/plants": {
                    post: {
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: { type: "object" },
                                    example: { name: "Snake Plant" }
                                }
                            }
                        },
                        responses: { "201": { description: "Created" } }
                    }
                }
            }
        };

        const examples = extractEnrichedExamples(original, enriched);
        expect(examples.paths["/plants"].post.requestBody.content["application/json"].example).toEqual({
            name: "Snake Plant"
        });
    });

    it("extracts response body examples that were added", () => {
        const original: Spec = {
            paths: {
                "/plants/{plantId}": {
                    get: {
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
        const enriched: Spec = {
            paths: {
                "/plants/{plantId}": {
                    get: {
                        responses: {
                            "200": {
                                description: "OK",
                                content: {
                                    "application/json": {
                                        schema: { type: "object" },
                                        example: { id: "fern-001", name: "Monstera" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const examples = extractEnrichedExamples(original, enriched);
        expect(examples.paths["/plants/{plantId}"].get.responses["200"].content["application/json"].example).toEqual({
            id: "fern-001",
            name: "Monstera"
        });
    });

    it("returns empty object when no examples were added", () => {
        const spec: Spec = {
            paths: {
                "/plants": { get: { responses: { "200": { description: "OK" } } } }
            }
        };

        const examples = extractEnrichedExamples(spec, spec);
        expect(examples).toEqual({});
    });

    it("does not extract pre-existing examples", () => {
        const original: Spec = {
            paths: {
                "/plants": {
                    get: {
                        parameters: [{ name: "limit", in: "query", schema: { type: "integer" }, example: 10 }],
                        responses: { "200": { description: "OK" } }
                    }
                }
            }
        };
        const enriched: Spec = structuredClone(original);

        const examples = extractEnrichedExamples(original, enriched);
        expect(examples).toEqual({});
    });
});
