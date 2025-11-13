import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { OpenAPIPruner } from "../pruner";
import { PruneOptions } from "../types";

describe("OpenAPIPruner", () => {
    it("should prune endpoints not in the selector list", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                },
                "/posts": {
                    get: {
                        summary: "Get posts",
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "get" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.paths["/users"]).toBeDefined();
        expect(result.document.paths["/posts"]).toBeUndefined();
        expect(result.statistics.originalEndpoints).toBe(2);
        expect(result.statistics.prunedEndpoints).toBe(1);
    });

    it("should retain schemas referenced by selected endpoints", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            $ref: "#/components/schemas/User"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/posts": {
                    get: {
                        summary: "Get posts",
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            $ref: "#/components/schemas/Post"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" }
                        }
                    },
                    Post: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            title: { type: "string" }
                        }
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "get" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.components?.schemas?.User).toBeDefined();
        expect(result.document.components?.schemas?.Post).toBeUndefined();
        expect(result.statistics.originalSchemas).toBe(2);
        expect(result.statistics.prunedSchemas).toBe(1);
    });

    it("should retain nested schema references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            $ref: "#/components/schemas/User"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            address: {
                                $ref: "#/components/schemas/Address"
                            }
                        }
                    },
                    Address: {
                        type: "object",
                        properties: {
                            street: { type: "string" },
                            city: { type: "string" }
                        }
                    },
                    UnusedSchema: {
                        type: "object",
                        properties: {
                            foo: { type: "string" }
                        }
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "get" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.components?.schemas?.User).toBeDefined();
        expect(result.document.components?.schemas?.Address).toBeDefined();
        expect(result.document.components?.schemas?.UnusedSchema).toBeUndefined();
        expect(result.statistics.prunedSchemas).toBe(2);
    });

    it("should retain request body schemas", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    post: {
                        summary: "Create user",
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/CreateUserRequest"
                                    }
                                }
                            }
                        },
                        responses: {
                            "201": {
                                description: "Created"
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    CreateUserRequest: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string" }
                        },
                        required: ["name", "email"]
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "post" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.components?.schemas?.CreateUserRequest).toBeDefined();
        expect(result.statistics.prunedSchemas).toBe(1);
    });

    it("should retain parameter references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users/{userId}": {
                    get: {
                        summary: "Get user",
                        parameters: [
                            {
                                $ref: "#/components/parameters/UserId"
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            },
            components: {
                parameters: {
                    UserId: {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    },
                    UnusedParam: {
                        name: "unused",
                        in: "query",
                        schema: {
                            type: "string"
                        }
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users/{userId}", method: "get" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.components?.parameters?.UserId).toBeDefined();
        expect(result.document.components?.parameters?.UnusedParam).toBeUndefined();
        expect(result.statistics.prunedParameters).toBe(1);
    });

    it("should retain security schemes used by selected endpoints", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        security: [
                            {
                                bearerAuth: []
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                },
                "/public": {
                    get: {
                        summary: "Public endpoint",
                        security: [
                            {
                                apiKey: []
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer"
                    },
                    apiKey: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key"
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "get" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.components?.securitySchemes?.bearerAuth).toBeDefined();
        expect(result.document.components?.securitySchemes?.apiKey).toBeUndefined();
        expect(result.statistics.prunedSecuritySchemes).toBe(1);
    });

    it("should handle allOf, oneOf, and anyOf schema compositions", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            $ref: "#/components/schemas/User"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    User: {
                        allOf: [
                            {
                                $ref: "#/components/schemas/BaseEntity"
                            },
                            {
                                type: "object",
                                properties: {
                                    name: { type: "string" }
                                }
                            }
                        ]
                    },
                    BaseEntity: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            createdAt: { type: "string", format: "date-time" }
                        }
                    },
                    UnusedSchema: {
                        type: "object",
                        properties: {
                            foo: { type: "string" }
                        }
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "get" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.components?.schemas?.User).toBeDefined();
        expect(result.document.components?.schemas?.BaseEntity).toBeDefined();
        expect(result.document.components?.schemas?.UnusedSchema).toBeUndefined();
    });

    it("should match endpoints without specifying method", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    },
                    post: {
                        summary: "Create user",
                        responses: {
                            "201": {
                                description: "Created"
                            }
                        }
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.paths["/users"]?.get).toBeDefined();
        expect(result.document.paths["/users"]?.post).toBeDefined();
        expect(result.statistics.prunedEndpoints).toBe(2);
    });

    it("should preserve descriptions, min/max ranges, and other metadata", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0",
                description: "This is a test API"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        description: "Retrieve a list of users",
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            $ref: "#/components/schemas/User"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    User: {
                        type: "object",
                        description: "A user object",
                        properties: {
                            id: {
                                type: "string",
                                description: "User ID"
                            },
                            age: {
                                type: "integer",
                                description: "User age",
                                minimum: 0,
                                maximum: 150
                            },
                            email: {
                                type: "string",
                                description: "User email",
                                format: "email",
                                pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                            }
                        },
                        required: ["id", "email"]
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "get" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.info.description).toBe("This is a test API");
        expect(result.document.paths["/users"]?.get?.description).toBe("Retrieve a list of users");

        const userSchema = result.document.components?.schemas?.User as OpenAPIV3.SchemaObject;
        expect(userSchema).toBeDefined();
        expect(userSchema.description).toBe("A user object");
        expect(userSchema.properties?.age).toMatchObject({
            type: "integer",
            description: "User age",
            minimum: 0,
            maximum: 150
        });
        expect(userSchema.properties?.email).toMatchObject({
            type: "string",
            description: "User email",
            format: "email",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        });
        expect(userSchema.required).toEqual(["id", "email"]);
    });

    it("should handle response references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        responses: {
                            "200": {
                                $ref: "#/components/responses/UserListResponse"
                            }
                        }
                    }
                }
            },
            components: {
                responses: {
                    UserListResponse: {
                        description: "A list of users",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/User"
                                    }
                                }
                            }
                        }
                    },
                    UnusedResponse: {
                        description: "Unused response"
                    }
                },
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            id: { type: "string" }
                        }
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "get" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.components?.responses?.UserListResponse).toBeDefined();
        expect(result.document.components?.responses?.UnusedResponse).toBeUndefined();
        expect(result.document.components?.schemas?.User).toBeDefined();
    });

    it("should handle request body references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    post: {
                        summary: "Create user",
                        requestBody: {
                            $ref: "#/components/requestBodies/CreateUserBody"
                        },
                        responses: {
                            "201": {
                                description: "Created"
                            }
                        }
                    }
                }
            },
            components: {
                requestBodies: {
                    CreateUserBody: {
                        description: "User creation request",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User"
                                }
                            }
                        }
                    },
                    UnusedBody: {
                        description: "Unused request body",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object"
                                }
                            }
                        }
                    }
                },
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: { type: "string" }
                        }
                    }
                }
            }
        };

        const options: PruneOptions = {
            document,
            endpoints: [{ path: "/users", method: "post" }]
        };

        const pruner = new OpenAPIPruner(options);
        const result = pruner.prune();

        expect(result.document.components?.requestBodies?.CreateUserBody).toBeDefined();
        expect(result.document.components?.requestBodies?.UnusedBody).toBeUndefined();
        expect(result.document.components?.schemas?.User).toBeDefined();
    });
});
