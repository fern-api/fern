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

    it("rewrites shared component responses in place", () => {
        const document = applyErrorResponses({
            document: createDocument(),
            errorResponses: { schema: PROBLEM_DETAILS },
            schema: PROBLEM_DETAILS
        });

        expect(getOperation(document, "get").responses["429"]).toEqual({
            $ref: "#/components/responses/TooManyRequests"
        });
        expect(document.components?.responses?.TooManyRequests).toEqual({
            description: "Too many requests",
            content: { "application/json": { schema: PROBLEM_DETAILS_REF } }
        });
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
