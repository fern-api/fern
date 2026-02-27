import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OperationContext } from "../openapi/v3/converters/contexts.js";
import { convertWebhookOperation } from "../openapi/v3/converters/operation/convertWebhookOperation.js";
import { OpenAPIV3ParserContext } from "../openapi/v3/OpenAPIV3ParserContext.js";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";

function createMockTaskContext(): TaskContext {
    return {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as TaskContext;
}

function createContext(document: OpenAPIV3.Document, taskContext: TaskContext, source: Source): OpenAPIV3ParserContext {
    return new OpenAPIV3ParserContext({
        document,
        taskContext,
        authHeaders: new Set(),
        options: DEFAULT_PARSE_OPENAPI_SETTINGS,
        source,
        namespace: undefined
    });
}

function createOperationContext(
    document: OpenAPIV3.Document,
    operation: OpenAPIV3.OperationObject,
    {
        method = "GET",
        path = "/webhooks/test",
        operationParameters = []
    }: {
        method?: string;
        path?: string;
        operationParameters?: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
    } = {}
): OperationContext {
    const pathItem: OpenAPIV3.PathItemObject = {};
    return {
        document,
        method: method as OperationContext["method"],
        path,
        pathItemParameters: [],
        pathItem,
        sdkMethodName: undefined,
        baseBreadcrumbs: ["webhooks", "test"],
        operationParameters,
        operation,
        pagination: undefined
    };
}

describe("convertWebhookOperation", () => {
    const source: Source = Source.openapi({ file: "test.yaml" });

    describe("GET webhooks with query parameters", () => {
        it("should synthesize a payload from query parameters for GET webhooks without a request body", () => {
            const mockTaskContext = createMockTaskContext();
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {}
            };
            const context = createContext(document, mockTaskContext, source);

            const operation: OpenAPIV3.OperationObject = {
                operationId: "testGetWebhook",
                responses: {},
                parameters: [
                    {
                        name: "event_type",
                        in: "query",
                        schema: { type: "string" },
                        description: "The type of event"
                    },
                    {
                        name: "timestamp",
                        in: "query",
                        schema: { type: "integer" },
                        description: "Event timestamp"
                    }
                ]
            };

            const operationContext = createOperationContext(document, operation, {
                method: "GET",
                operationParameters: operation.parameters as OpenAPIV3.ParameterObject[]
            });

            const result = convertWebhookOperation({ context, operationContext, source });

            expect(result).toHaveLength(1);
            const webhook = result[0];
            expect.assert(webhook != null);
            expect(webhook.operationId).toBe("testGetWebhook");
            expect(webhook.method).toBe("GET");

            // Verify the payload is an object schema synthesized from query params
            expect(webhook.payload.type).toBe("object");
            if (webhook.payload.type === "object") {
                expect(webhook.payload.properties).toHaveLength(2);

                const eventTypeProp = webhook.payload.properties[0];
                expect.assert(eventTypeProp != null);
                expect(eventTypeProp.key).toBe("event_type");

                const timestampProp = webhook.payload.properties[1];
                expect.assert(timestampProp != null);
                expect(timestampProp.key).toBe("timestamp");
            }
        });

        it("should use wire name (not SDK override) as the property key", () => {
            const mockTaskContext = createMockTaskContext();
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {}
            };
            const context = createContext(document, mockTaskContext, source);

            const operation: OpenAPIV3.OperationObject = {
                operationId: "testOverrideWebhook",
                responses: {},
                parameters: [
                    {
                        name: "event_type",
                        in: "query",
                        schema: { type: "string" },
                        "x-fern-parameter-name": "eventType"
                    } as OpenAPIV3.ParameterObject
                ]
            };

            const operationContext = createOperationContext(document, operation, {
                method: "GET",
                operationParameters: operation.parameters as OpenAPIV3.ParameterObject[]
            });

            const result = convertWebhookOperation({ context, operationContext, source });

            expect(result).toHaveLength(1);
            const webhook = result[0];
            expect.assert(webhook != null);
            if (webhook.payload.type === "object") {
                const prop = webhook.payload.properties[0];
                expect.assert(prop != null);
                // key should be the wire name, not the SDK override
                expect(prop.key).toBe("event_type");
                // nameOverride should hold the SDK display name
                expect(prop.nameOverride).toBe("eventType");
            }
        });

        it("should set multipartFormData to undefined for GET webhooks", () => {
            const mockTaskContext = createMockTaskContext();
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {}
            };
            const context = createContext(document, mockTaskContext, source);

            const operation: OpenAPIV3.OperationObject = {
                operationId: "testMultipartCheck",
                responses: {},
                parameters: [
                    {
                        name: "data",
                        in: "query",
                        schema: { type: "string" }
                    }
                ]
            };

            const operationContext = createOperationContext(document, operation, {
                method: "GET",
                operationParameters: operation.parameters as OpenAPIV3.ParameterObject[]
            });

            const result = convertWebhookOperation({ context, operationContext, source });

            expect(result).toHaveLength(1);
            expect(result[0]?.multipartFormData).toBeUndefined();
        });
    });

    describe("GET webhooks without query parameters or request body", () => {
        it("should skip and log an error when GET webhook has no query parameters and no request body", () => {
            const mockTaskContext = createMockTaskContext();
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {}
            };
            const context = createContext(document, mockTaskContext, source);

            const operation: OpenAPIV3.OperationObject = {
                operationId: "emptyGetWebhook",
                responses: {}
            };

            const operationContext = createOperationContext(document, operation, { method: "GET" });

            const result = convertWebhookOperation({ context, operationContext, source });

            expect(result).toHaveLength(0);
            expect(mockTaskContext.logger.error).toHaveBeenCalledWith(
                expect.stringContaining("Missing a request body and no query parameters")
            );
        });
    });

    describe("other HTTP methods", () => {
        it("should skip webhooks with unsupported methods and log a warning", () => {
            const mockTaskContext = createMockTaskContext();
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {}
            };
            const context = createContext(document, mockTaskContext, source);

            const operation: OpenAPIV3.OperationObject = {
                operationId: "putWebhook",
                responses: {},
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { type: "object", properties: { data: { type: "string" } } }
                        }
                    }
                }
            };

            const operationContext = createOperationContext(document, operation, { method: "PUT" });

            const result = convertWebhookOperation({ context, operationContext, source });

            expect(result).toHaveLength(0);
            expect(mockTaskContext.logger.warn).toHaveBeenCalledWith(
                expect.stringContaining("Only POST and GET methods are currently supported")
            );
        });
    });

    describe("POST webhooks with request body", () => {
        it("should convert POST webhooks with a JSON request body", () => {
            const mockTaskContext = createMockTaskContext();
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {}
            };
            const context = createContext(document, mockTaskContext, source);

            const operation: OpenAPIV3.OperationObject = {
                operationId: "testPostWebhook",
                responses: {},
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    event: { type: "string" },
                                    payload: { type: "object" }
                                }
                            }
                        }
                    }
                }
            };

            const operationContext = createOperationContext(document, operation, { method: "POST" });

            const result = convertWebhookOperation({ context, operationContext, source });

            expect(result).toHaveLength(1);
            const webhook = result[0];
            expect.assert(webhook != null);
            expect(webhook.operationId).toBe("testPostWebhook");
            expect(webhook.method).toBe("POST");
        });
    });

    describe("POST webhooks without request body", () => {
        it("should synthesize payload from query parameters for POST webhooks without a request body", () => {
            const mockTaskContext = createMockTaskContext();
            const document: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {}
            };
            const context = createContext(document, mockTaskContext, source);

            const operation: OpenAPIV3.OperationObject = {
                operationId: "postNoBodyWebhook",
                responses: {},
                parameters: [
                    {
                        name: "callback_url",
                        in: "query",
                        schema: { type: "string" }
                    }
                ]
            };

            const operationContext = createOperationContext(document, operation, {
                method: "POST",
                operationParameters: operation.parameters as OpenAPIV3.ParameterObject[]
            });

            const result = convertWebhookOperation({ context, operationContext, source });

            expect(result).toHaveLength(1);
            const webhook = result[0];
            expect.assert(webhook != null);
            expect(webhook.method).toBe("POST");
            if (webhook.payload.type === "object") {
                expect(webhook.payload.properties).toHaveLength(1);
                expect(webhook.payload.properties[0]?.key).toBe("callback_url");
            }
        });
    });
});
