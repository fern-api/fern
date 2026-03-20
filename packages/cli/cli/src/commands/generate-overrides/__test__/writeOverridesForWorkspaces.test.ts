import { Endpoint, HttpMethod, OpenApiIntermediateRepresentation, Schema } from "@fern-api/openapi-ir";
import { TaskContext, TaskResult } from "@fern-api/task-context";
import { noop } from "lodash-es";
import { describe, expect, it } from "vitest";

import { generateOverridesContent } from "../writeOverridesForWorkspaces.js";

function createMockContext(): TaskContext {
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
        },
        takeOverTerminal: async () => {
            return;
        },
        failAndThrow: (message?: string) => {
            throw new Error(message ?? "Task failed");
        },
        failWithoutThrowing: noop,
        getResult: () => TaskResult.Success,
        addInteractiveTask: () => {
            throw new Error("Not implemented in mock");
        },
        runInteractiveTask: async () => false,
        instrumentPostHogEvent: async () => {
            return;
        }
    };
}

function createMinimalEndpoint(overrides: {
    path: string;
    method: HttpMethod;
    operationId?: string;
    tags?: string[];
}): Endpoint {
    return {
        authed: false,
        security: undefined,
        internal: undefined,
        idempotent: undefined,
        method: overrides.method,
        audiences: [],
        path: overrides.path,
        summary: undefined,
        operationId: overrides.operationId ?? undefined,
        tags: overrides.tags ?? [],
        pathParameters: [],
        queryParameters: [],
        headers: [],
        sdkName: undefined,
        generatedRequestName: "Request",
        requestNameOverride: undefined,
        request: undefined,
        response: undefined,
        errors: {},
        servers: [],
        examples: [],
        pagination: undefined,
        description: undefined,
        availability: undefined,
        source: undefined,
        namespace: undefined,
        retries: undefined
    };
}

function createMinimalIR(overrides?: {
    endpoints?: Endpoint[];
    rootSchemas?: Record<string, Schema>;
    namespacedSchemas?: Record<string, Record<string, Schema>>;
}): OpenApiIntermediateRepresentation {
    return {
        apiVersion: undefined,
        title: undefined,
        description: undefined,
        basePath: undefined,
        servers: [],
        websocketServers: [],
        groups: {},
        tags: { tagsById: {}, orderedTagIds: undefined },
        hasEndpointsMarkedInternal: false,
        endpoints: overrides?.endpoints ?? [],
        webhooks: [],
        channels: {},
        groupedSchemas: {
            rootSchemas: overrides?.rootSchemas ?? {},
            namespacedSchemas: overrides?.namespacedSchemas ?? {}
        },
        variables: {},
        nonRequestReferencedSchemas: new Set(),
        securitySchemes: {},
        security: undefined,
        globalHeaders: undefined,
        idempotencyHeaders: undefined
    };
}

function createObjectSchema(nameOverride: string): Schema {
    return Schema.object({
        allOf: [],
        properties: [],
        allOfPropertyConflicts: [],
        additionalProperties: false,
        minProperties: undefined,
        maxProperties: undefined,
        nameOverride,
        generatedName: nameOverride,
        groupName: undefined,
        description: undefined,
        availability: undefined,
        encoding: undefined,
        source: undefined,
        namespace: undefined,
        title: undefined,
        inline: undefined
    });
}

describe("generateOverridesContent", () => {
    const context = createMockContext();

    it("generates SDK method names for an endpoint with operationId and tag", () => {
        const ir = createMinimalIR({
            endpoints: [
                createMinimalEndpoint({
                    path: "/pets",
                    method: HttpMethod.Get,
                    operationId: "pets_list",
                    tags: ["pets"]
                })
            ]
        });

        const result = generateOverridesContent({ ir, existingOverrides: null, includeModels: false, context });

        expect(result.paths["/pets"]).toBeDefined();
        expect(result.paths["/pets"]?.get).toEqual({
            "x-fern-sdk-group-name": ["pets"],
            "x-fern-sdk-method-name": "list"
        });
    });

    it("generates SDK method names for an endpoint with only operationId (no tag)", () => {
        const ir = createMinimalIR({
            endpoints: [
                createMinimalEndpoint({
                    path: "/health",
                    method: HttpMethod.Get,
                    operationId: "healthCheck"
                })
            ]
        });

        const result = generateOverridesContent({ ir, existingOverrides: null, includeModels: false, context });

        expect(result.paths["/health"]).toBeDefined();
        // With no tag and operationId, it goes to __package__.yml and endpointId is the operationId
        expect(result.paths["/health"]?.get).toEqual({
            "x-fern-sdk-method-name": "healthCheck"
        });
    });

    it("preserves existing override content when merging", () => {
        // The function checks by uppercase method (endpoint.method = "GET")
        // so existing entries must use uppercase keys to be preserved
        const existingOverrides = {
            paths: {
                "/pets": {
                    GET: {
                        "x-fern-sdk-group-name": ["animals"],
                        "x-fern-sdk-method-name": "getAll"
                    }
                }
            }
        };

        const ir = createMinimalIR({
            endpoints: [
                createMinimalEndpoint({
                    path: "/pets",
                    method: HttpMethod.Get,
                    operationId: "listPets",
                    tags: ["pets"]
                })
            ]
        });

        const result = generateOverridesContent({ ir, existingOverrides, includeModels: false, context });

        // Existing uppercase entry is found, so the endpoint is not overwritten.
        // The new lowercase key is not written since the uppercase check passes.
        expect(result.paths["/pets"]?.GET).toEqual({
            "x-fern-sdk-group-name": ["animals"],
            "x-fern-sdk-method-name": "getAll"
        });
        // No lowercase entry was added
        expect(result.paths["/pets"]?.get).toBeUndefined();
    });

    it("handles multiple endpoints across different paths and methods", () => {
        const ir = createMinimalIR({
            endpoints: [
                createMinimalEndpoint({
                    path: "/pets",
                    method: HttpMethod.Get,
                    operationId: "pets_list",
                    tags: ["pets"]
                }),
                createMinimalEndpoint({
                    path: "/pets",
                    method: HttpMethod.Post,
                    operationId: "pets_create",
                    tags: ["pets"]
                }),
                createMinimalEndpoint({
                    path: "/owners",
                    method: HttpMethod.Get,
                    operationId: "owners_list",
                    tags: ["owners"]
                })
            ]
        });

        const result = generateOverridesContent({ ir, existingOverrides: null, includeModels: false, context });

        expect(result.paths["/pets"]?.get).toEqual({
            "x-fern-sdk-group-name": ["pets"],
            "x-fern-sdk-method-name": "list"
        });
        expect(result.paths["/pets"]?.post).toEqual({
            "x-fern-sdk-group-name": ["pets"],
            "x-fern-sdk-method-name": "create"
        });
        expect(result.paths["/owners"]?.get).toEqual({
            "x-fern-sdk-group-name": ["owners"],
            "x-fern-sdk-method-name": "list"
        });
    });

    it("adds x-fern-type-name for schemas when includeModels is true", () => {
        const ir = createMinimalIR({
            rootSchemas: {
                Pet: createObjectSchema("Pet")
            }
        });

        const result = generateOverridesContent({ ir, existingOverrides: null, includeModels: true, context });

        expect(result.components.schemas?.Pet).toEqual({
            "x-fern-type-name": "Pet"
        });
    });

    it("does not add schemas when includeModels is false", () => {
        const ir = createMinimalIR({
            rootSchemas: {
                Pet: createObjectSchema("Pet")
            }
        });

        const result = generateOverridesContent({ ir, existingOverrides: null, includeModels: false, context });

        expect(Object.keys(result.components.schemas ?? {})).toHaveLength(0);
    });

    it("returns empty paths and schemas for empty IR", () => {
        const ir = createMinimalIR();

        const result = generateOverridesContent({ ir, existingOverrides: null, includeModels: false, context });

        expect(result.paths).toEqual({});
        expect(result.components.schemas).toEqual({});
    });
});
