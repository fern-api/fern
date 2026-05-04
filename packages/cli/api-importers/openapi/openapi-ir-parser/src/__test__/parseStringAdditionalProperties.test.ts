import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";
import { parse } from "../parse.js";

describe("parse with string additionalProperties", () => {
    const mockTaskContext = {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            trace: vi.fn(),
            log: vi.fn()
        }
    } as unknown as TaskContext;

    it('should not crash when additionalProperties is string "true"', () => {
        const doc: OpenAPIV3.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0" },
            paths: {
                "/test": {
                    post: {
                        operationId: "testEndpoint",
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        // String "true" instead of boolean — invalid but seen in real specs
                                        additionalProperties: "true" as unknown as boolean,
                                        title: "Event"
                                    }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "OK"
                            }
                        }
                    }
                }
            }
        };

        // Should not throw "Cannot use 'in' operator to search for 'type' in true"
        expect(() =>
            parse({
                context: mockTaskContext,
                documents: [
                    {
                        type: "openapi",
                        value: doc,
                        source: Source.openapi({ file: "test.yml" }),
                        settings: DEFAULT_PARSE_OPENAPI_SETTINGS
                    }
                ]
            })
        ).not.toThrow();
    });

    it("should not crash when additionalProperties is boolean true", () => {
        const doc: OpenAPIV3.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0" },
            paths: {
                "/test": {
                    post: {
                        operationId: "testEndpoint",
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        additionalProperties: true
                                    }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "OK"
                            }
                        }
                    }
                }
            }
        };

        expect(() =>
            parse({
                context: mockTaskContext,
                documents: [
                    {
                        type: "openapi",
                        value: doc,
                        source: Source.openapi({ file: "test.yml" }),
                        settings: DEFAULT_PARSE_OPENAPI_SETTINGS
                    }
                ]
            })
        ).not.toThrow();
    });
});
