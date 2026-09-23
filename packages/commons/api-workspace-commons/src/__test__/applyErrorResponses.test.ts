import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { applyErrorResponses } from "../openapi/applyErrorResponses.js";

const PROBLEM_DETAILS: Record<string, unknown> = {
    type: "object",
    properties: {
        type: { type: "string" },
        title: { type: "string" },
        status: { type: "integer" }
    }
};

const PROBLEM_DETAILS_REF = { $ref: "#/components/schemas/ProblemDetails" };

function createDocument(): OpenAPIV3.Document {
    return {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0" },
        paths: {
            "/items": {
                get: {
                    responses: {
                        "200": { description: "OK" },
                        "204": { $ref: "#/components/responses/TooManyRequests" },
                        "401": { description: "Unauthorized" },
                        "429": { $ref: "#/components/responses/TooManyRequests" }
                    }
                },
                post: {
                    responses: {
                        "201": { description: "Created" },
                        "400": {
                            description: "Bad Request",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/LegacyError" },
                                    example: { code: 1 }
                                }
                            }
                        },
                        "5XX": {
                            description: "Server error",
                            headers: { "Retry-After": { schema: { type: "integer" } } },
                            content: { "application/problem+json": { example: { title: "boom" } } }
                        }
                    }
                }
            }
        },
        components: {
            responses: { TooManyRequests: { description: "Too many requests" } },
            schemas: { LegacyError: { type: "object" } }
        }
    };
}

function getOperation(document: OpenAPIV3.Document, method: "get" | "post"): OpenAPIV3.OperationObject {
    const operation = document.paths["/items"]?.[method];
    if (operation == null) {
        throw new Error(`Missing ${method} /items`);
    }
    return operation;
}

function getResponse(
    document: OpenAPIV3.Document,
    method: "get" | "post",
    statusCode: string
): OpenAPIV3.ResponseObject {
    const response = getOperation(document, method).responses[statusCode];
    if (response == null || "$ref" in response) {
        throw new Error(`Expected inline ${statusCode} response on ${method} /items`);
    }
    return response;
}

describe("applyErrorResponses", () => {
    it("registers the schema and types untyped errors (apply-to: all)", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema: PROBLEM_DETAILS },
            schema: PROBLEM_DETAILS
        });

        expect(document.components?.schemas?.ProblemDetails).toEqual(PROBLEM_DETAILS);
        expect(getResponse(document, "get", "401")).toEqual({
            description: "Unauthorized",
            content: { "application/json": { schema: PROBLEM_DETAILS_REF } }
        });
        expect(getResponse(document, "get", "200")).toEqual({ description: "OK" });
        expect(getResponse(document, "post", "201")).toEqual({ description: "Created" });
    });

    it("inlines a modified copy of shared component responses without mutating the component", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema: PROBLEM_DETAILS },
            schema: PROBLEM_DETAILS
        });

        expect(getResponse(document, "get", "429")).toEqual({
            description: "Too many requests",
            content: { "application/json": { schema: PROBLEM_DETAILS_REF } }
        });
        expect(getOperation(document, "get").responses["204"]).toEqual({
            $ref: "#/components/responses/TooManyRequests"
        });
        expect(document.components?.responses?.TooManyRequests).toEqual({ description: "Too many requests" });
    });

    it("reuses an identical existing component schema and rejects a conflicting one", () => {
        const identical = createDocument();
        identical.components = { ...identical.components, schemas: { ProblemDetails: { ...PROBLEM_DETAILS } } };
        expect(() =>
            applyErrorResponses({
                document: identical,
                errorResponses: { schema: PROBLEM_DETAILS },
                schema: PROBLEM_DETAILS
            })
        ).not.toThrow();

        expect(() =>
            applyErrorResponses({
                document: createDocument(),
                errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError", "apply-to": "untyped" },
                schema: PROBLEM_DETAILS
            })
        ).toThrow(
            'components.schemas already contains a different schema named "LegacyError" that is still referenced from ' +
                "#/paths/~1items/post/responses/400/content/application~1json/schema"
        );
    });

    it("replaces a same-named legacy schema once every reference to it has been rewritten", () => {
        const withSharedResponse = createDocument();
        withSharedResponse.components = {
            ...withSharedResponse.components,
            responses: {
                ...withSharedResponse.components?.responses,
                Conflict: {
                    description: "Conflict",
                    content: { "application/json": { schema: { $ref: "#/components/schemas/LegacyError" } } }
                }
            }
        };
        getOperation(withSharedResponse, "post").responses["409"] = { $ref: "#/components/responses/Conflict" };

        const document = applyErrorResponses({
            document: withSharedResponse,
            errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError" },
            schema: PROBLEM_DETAILS
        });

        expect(document.components?.schemas?.LegacyError).toEqual(PROBLEM_DETAILS);
        const legacyRef = { $ref: "#/components/schemas/LegacyError" };
        expect(getResponse(document, "post", "400").content?.["application/json"]?.schema).toEqual(legacyRef);
        expect(getResponse(document, "post", "409").content?.["application/json"]?.schema).toEqual(legacyRef);
    });

    it("ignores legacy references inside unreachable shared responses, even through response chains", () => {
        const withDeadChain = createDocument();
        withDeadChain.components = {
            ...withDeadChain.components,
            responses: {
                ...withDeadChain.components?.responses,
                DeadAlias: { $ref: "#/components/responses/DeadTarget" },
                DeadTarget: {
                    description: "Unused",
                    content: { "application/json": { schema: { $ref: "#/components/schemas/LegacyError" } } }
                }
            }
        };

        const document = applyErrorResponses({
            document: withDeadChain,
            errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError" },
            schema: PROBLEM_DETAILS
        });

        expect(document.components?.schemas?.LegacyError).toEqual(PROBLEM_DETAILS);
    });

    it("rejects replacing a legacy schema referenced from a reachable shared response", () => {
        const throughNestedPointer = createDocument();
        throughNestedPointer.components = {
            ...throughNestedPointer.components,
            responses: {
                ...throughNestedPointer.components?.responses,
                Legacy: {
                    description: "Legacy",
                    content: { "application/json": { schema: { $ref: "#/components/schemas/LegacyError" } } }
                }
            }
        };
        getOperation(throughNestedPointer, "get").responses["200"] = {
            description: "OK",
            content: {
                "application/json": {
                    schema: { $ref: "#/components/responses/Legacy/content/application~1json/schema" }
                }
            }
        };
        expect(() =>
            applyErrorResponses({
                document: throughNestedPointer,
                errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError" },
                schema: PROBLEM_DETAILS
            })
        ).toThrow("still referenced from #/components/responses/Legacy/content/application~1json/schema");

        const throughResponseChain = createDocument();
        throughResponseChain.components = {
            ...throughResponseChain.components,
            responses: {
                ...throughResponseChain.components?.responses,
                Alias: { $ref: "#/components/responses/Legacy" },
                Legacy: {
                    description: "Legacy",
                    content: { "application/json": { schema: { $ref: "#/components/schemas/LegacyError" } } }
                }
            }
        };
        getOperation(throughResponseChain, "get").responses["200"] = { $ref: "#/components/responses/Alias" };
        expect(() =>
            applyErrorResponses({
                document: throughResponseChain,
                errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError" },
                schema: PROBLEM_DETAILS
            })
        ).toThrow("still referenced from #/components/responses/Legacy/content/application~1json/schema");
    });

    it("rejects replacing a same-named legacy schema that is still referenced elsewhere", () => {
        const fromSuccessResponse = createDocument();
        getOperation(fromSuccessResponse, "get").responses["200"] = {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/LegacyError" } } }
        };
        expect(() =>
            applyErrorResponses({
                document: fromSuccessResponse,
                errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError" },
                schema: PROBLEM_DETAILS
            })
        ).toThrow("still referenced from #/paths/~1items/get/responses/200/content/application~1json/schema");

        const fromOtherSchema = createDocument();
        fromOtherSchema.components = {
            ...fromOtherSchema.components,
            schemas: {
                ...fromOtherSchema.components?.schemas,
                Wrapper: { type: "object", properties: { error: { $ref: "#/components/schemas/LegacyError" } } }
            }
        };
        expect(() =>
            applyErrorResponses({
                document: fromOtherSchema,
                errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError" },
                schema: PROBLEM_DETAILS
            })
        ).toThrow("still referenced from #/components/schemas/Wrapper/properties/error");

        const fromRefSibling = createDocument();
        fromRefSibling.components = {
            ...fromRefSibling.components,
            schemas: {
                ...fromRefSibling.components?.schemas,
                Wrapper: {
                    $ref: "#/components/schemas/Base",
                    properties: { error: { $ref: "#/components/schemas/LegacyError" } }
                }
            }
        };
        expect(() =>
            applyErrorResponses({
                document: fromRefSibling,
                errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError" },
                schema: PROBLEM_DETAILS
            })
        ).toThrow("still referenced from #/components/schemas/Wrapper/properties/error");

        const fromDiscriminatorMapping = createDocument();
        fromDiscriminatorMapping.components = {
            ...fromDiscriminatorMapping.components,
            schemas: {
                ...fromDiscriminatorMapping.components?.schemas,
                Union: {
                    oneOf: [{ $ref: "#/components/schemas/Base" }],
                    discriminator: { propertyName: "kind", mapping: { legacy: "#/components/schemas/LegacyError" } }
                }
            }
        };
        expect(() =>
            applyErrorResponses({
                document: fromDiscriminatorMapping,
                errorResponses: { schema: PROBLEM_DETAILS, name: "LegacyError" },
                schema: PROBLEM_DETAILS
            })
        ).toThrow("still referenced from #/components/schemas/Union/discriminator/mapping/legacy");
    });

    it("escapes JSON pointer characters in the component name", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema: PROBLEM_DETAILS, name: "errors/Problem~Details" },
            schema: PROBLEM_DETAILS
        });

        expect(document.components?.schemas?.["errors/Problem~Details"]).toEqual(PROBLEM_DETAILS);
        expect(getResponse(document, "get", "401").content?.["application/json"]?.schema).toEqual({
            $ref: "#/components/schemas/errors~1Problem~0Details"
        });
    });

    it("rejects schemas with non-local $refs", () => {
        const schema = {
            type: "object",
            properties: { detail: { $ref: "./common.yml#/components/schemas/Detail" } }
        };
        expect(() => applyErrorResponses({ document: createDocument(), errorResponses: { schema }, schema })).toThrow(
            "./common.yml#/components/schemas/Detail"
        );
    });

    it("rejects ensure rules with non-error status codes", () => {
        expect(() =>
            applyErrorResponses({
                document: createDocument(),
                errorResponses: { schema: PROBLEM_DETAILS, ensure: [{ "status-code": 200 }] },
                schema: PROBLEM_DETAILS
            })
        ).toThrow("error-responses.ensure.status-code must be between 400 and 599, got 200");
    });

    it("replaces typed errors and drops their stale examples (apply-to: all)", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema: PROBLEM_DETAILS, name: "ServiceError", "apply-to": "all" },
            schema: PROBLEM_DETAILS
        });

        expect(getResponse(document, "post", "400")).toEqual({
            description: "Bad Request",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceError" } } }
        });
        expect(document.components?.schemas?.ServiceError).toEqual(PROBLEM_DETAILS);
        expect(document.components?.schemas?.LegacyError).toEqual({ type: "object" });
    });

    it("keeps typed errors and only fills untyped ones (apply-to: untyped)", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema: PROBLEM_DETAILS, "apply-to": "untyped" },
            schema: PROBLEM_DETAILS
        });

        expect(getResponse(document, "post", "400").content?.["application/json"]).toEqual({
            schema: { $ref: "#/components/schemas/LegacyError" },
            example: { code: 1 }
        });
        expect(getResponse(document, "get", "401").content?.["application/json"]?.schema).toEqual(PROBLEM_DETAILS_REF);
    });

    it("preserves headers, media types and examples of schemaless responses (5XX wildcard)", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema: PROBLEM_DETAILS },
            schema: PROBLEM_DETAILS
        });

        expect(getResponse(document, "post", "5XX")).toEqual({
            description: "Server error",
            headers: { "Retry-After": { schema: { type: "integer" } } },
            content: { "application/problem+json": { example: { title: "boom" }, schema: PROBLEM_DETAILS_REF } }
        });
    });

    it("adds ensured status codes to the configured methods only", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: {
                schema: PROBLEM_DETAILS,
                ensure: [{ "status-code": 422, methods: ["post", "put", "patch"] }, { "status-code": 401 }]
            },
            schema: PROBLEM_DETAILS
        });

        expect(getResponse(document, "post", "422")).toEqual({
            description: "Unprocessable Entity",
            content: { "application/json": { schema: PROBLEM_DETAILS_REF } }
        });
        expect(getOperation(document, "get").responses["422"]).toBeUndefined();
        expect(getResponse(document, "post", "401")).toEqual({
            description: "Unauthorized",
            content: { "application/json": { schema: PROBLEM_DETAILS_REF } }
        });
        expect(getResponse(document, "get", "401").description).toBe("Unauthorized");
    });

    it("uses the schema title as the type name when no name is configured", () => {
        const schema = { ...PROBLEM_DETAILS, title: "ApiProblem" };
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema },
            schema
        });

        expect(document.components?.schemas?.ApiProblem).toEqual(schema);
        expect(getResponse(document, "get", "401").content?.["application/json"]?.schema).toEqual({
            $ref: "#/components/schemas/ApiProblem"
        });
    });

    it("uses a $ref schema as-is without registering a component", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema: { $ref: "#/components/schemas/LegacyError" } },
            schema: { $ref: "#/components/schemas/LegacyError" }
        });

        expect(Object.keys(document.components?.schemas ?? {})).toEqual(["LegacyError"]);
        expect(getResponse(document, "get", "401").content?.["application/json"]?.schema).toEqual({
            $ref: "#/components/schemas/LegacyError"
        });
    });
});
