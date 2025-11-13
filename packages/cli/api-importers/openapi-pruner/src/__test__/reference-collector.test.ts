import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { ReferenceCollector } from "../reference-collector";

describe("ReferenceCollector", () => {
    it("should collect schema references from responses", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {},
            components: {
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

        const collector = new ReferenceCollector(document);
        const operation: OpenAPIV3.OperationObject = {
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
        };

        collector.collectFromOperation(operation);
        expect(collector.getSchemas().has("User")).toBe(true);
    });

    it("should collect nested schema references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            address: {
                                $ref: "#/components/schemas/Address"
                            }
                        }
                    },
                    Address: {
                        type: "object",
                        properties: {
                            street: { type: "string" }
                        }
                    }
                }
            }
        };

        const collector = new ReferenceCollector(document);
        const operation: OpenAPIV3.OperationObject = {
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
        };

        collector.collectFromOperation(operation);
        expect(collector.getSchemas().has("User")).toBe(true);
        expect(collector.getSchemas().has("Address")).toBe(true);
    });

    it("should collect parameter references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {},
            components: {
                parameters: {
                    UserId: {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "string" }
                    }
                }
            }
        };

        const collector = new ReferenceCollector(document);
        const operation: OpenAPIV3.OperationObject = {
            parameters: [
                {
                    $ref: "#/components/parameters/UserId"
                }
            ],
            responses: {}
        };

        collector.collectFromOperation(operation);
        expect(collector.getParameters().has("UserId")).toBe(true);
    });

    it("should collect security scheme references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer"
                    }
                }
            }
        };

        const collector = new ReferenceCollector(document);
        const operation: OpenAPIV3.OperationObject = {
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {}
        };

        collector.collectFromOperation(operation);
        expect(collector.getSecuritySchemes().has("bearerAuth")).toBe(true);
    });

    it("should collect references from allOf, oneOf, anyOf", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    User: {
                        allOf: [
                            { $ref: "#/components/schemas/BaseEntity" },
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
                            id: { type: "string" }
                        }
                    }
                }
            }
        };

        const collector = new ReferenceCollector(document);
        const operation: OpenAPIV3.OperationObject = {
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
        };

        collector.collectFromOperation(operation);
        expect(collector.getSchemas().has("User")).toBe(true);
        expect(collector.getSchemas().has("BaseEntity")).toBe(true);
    });

    it("should collect request body references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {},
            components: {
                requestBodies: {
                    CreateUserBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User"
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

        const collector = new ReferenceCollector(document);
        const operation: OpenAPIV3.OperationObject = {
            requestBody: {
                $ref: "#/components/requestBodies/CreateUserBody"
            },
            responses: {}
        };

        collector.collectFromOperation(operation);
        expect(collector.getRequestBodies().has("CreateUserBody")).toBe(true);
        expect(collector.getSchemas().has("User")).toBe(true);
    });

    it("should collect response references", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {},
            components: {
                responses: {
                    UserResponse: {
                        description: "User response",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/User"
                                }
                            }
                        }
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

        const collector = new ReferenceCollector(document);
        const operation: OpenAPIV3.OperationObject = {
            responses: {
                "200": {
                    $ref: "#/components/responses/UserResponse"
                }
            }
        };

        collector.collectFromOperation(operation);
        expect(collector.getResponses().has("UserResponse")).toBe(true);
        expect(collector.getSchemas().has("User")).toBe(true);
    });
});
