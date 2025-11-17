import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertSchema } from "../../schema/convertSchemas";

describe("multipart/form-data and file uploads", () => {
    const mockTaskContext = {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as TaskContext;

    const source: Source = Source.openapi({
        file: "test.yaml"
    });

    it("should handle multipart/form-data with file upload", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/upload": {
                    post: {
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            file: {
                                                type: "string",
                                                format: "binary"
                                            },
                                            description: {
                                                type: "string"
                                            }
                                        },
                                        required: ["file"]
                                    }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const requestBody = openApiDocument.paths["/upload"]?.post?.requestBody as OpenAPIV3.RequestBodyObject;
        const schema = requestBody.content["multipart/form-data"]?.schema as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["UploadRequest"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle multipart/form-data with multiple files", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/upload-multiple": {
                    post: {
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            files: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                    format: "binary"
                                                }
                                            },
                                            metadata: {
                                                type: "object",
                                                properties: {
                                                    title: { type: "string" },
                                                    tags: {
                                                        type: "array",
                                                        items: { type: "string" }
                                                    }
                                                }
                                            }
                                        },
                                        required: ["files"]
                                    }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const requestBody = openApiDocument.paths["/upload-multiple"]?.post?.requestBody as OpenAPIV3.RequestBodyObject;
        const schema = requestBody.content["multipart/form-data"]?.schema as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["MultipleUploadRequest"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle multipart/form-data with mixed content types", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/upload-mixed": {
                    post: {
                        requestBody: {
                            content: {
                                "multipart/form-data": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            document: {
                                                type: "string",
                                                format: "binary"
                                            },
                                            thumbnail: {
                                                type: "string",
                                                format: "binary"
                                            },
                                            title: {
                                                type: "string"
                                            },
                                            category: {
                                                type: "string",
                                                enum: ["image", "video", "document"]
                                            },
                                            isPublic: {
                                                type: "boolean"
                                            }
                                        },
                                        required: ["document", "title"]
                                    }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const requestBody = openApiDocument.paths["/upload-mixed"]?.post?.requestBody as OpenAPIV3.RequestBodyObject;
        const schema = requestBody.content["multipart/form-data"]?.schema as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["MixedUploadRequest"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle application/x-www-form-urlencoded", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/form-submit": {
                    post: {
                        requestBody: {
                            content: {
                                "application/x-www-form-urlencoded": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            username: { type: "string" },
                                            password: { type: "string" },
                                            rememberMe: { type: "boolean" }
                                        },
                                        required: ["username", "password"]
                                    }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const requestBody = openApiDocument.paths["/form-submit"]?.post?.requestBody as OpenAPIV3.RequestBodyObject;
        const schema = requestBody.content["application/x-www-form-urlencoded"]?.schema as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["FormSubmitRequest"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle binary response format", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/download": {
                    get: {
                        responses: {
                            "200": {
                                description: "File download",
                                content: {
                                    "application/octet-stream": {
                                        schema: {
                                            type: "string",
                                            format: "binary"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const response = openApiDocument.paths["/download"]?.get?.responses["200"] as OpenAPIV3.ResponseObject;
        const schema = response.content?.["application/octet-stream"]?.schema as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["DownloadResponse"], source, context);

        expect(result).toBeDefined();
    });
});
