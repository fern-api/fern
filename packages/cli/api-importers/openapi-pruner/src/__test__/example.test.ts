import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { OpenAPIPruner } from "../pruner";

describe("Example Usage", () => {
    it("should demonstrate basic pruning", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "Pet Store API",
                version: "1.0.0",
                description: "A sample Pet Store API"
            },
            servers: [
                {
                    url: "https://api.petstore.com/v1"
                }
            ],
            paths: {
                "/pets": {
                    get: {
                        summary: "List all pets",
                        operationId: "listPets",
                        tags: ["pets"],
                        responses: {
                            "200": {
                                description: "A paged array of pets",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/Pet"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    post: {
                        summary: "Create a pet",
                        operationId: "createPet",
                        tags: ["pets"],
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/NewPet"
                                    }
                                }
                            }
                        },
                        responses: {
                            "201": {
                                description: "Pet created"
                            }
                        }
                    }
                },
                "/pets/{petId}": {
                    get: {
                        summary: "Info for a specific pet",
                        operationId: "showPetById",
                        tags: ["pets"],
                        parameters: [
                            {
                                name: "petId",
                                in: "path",
                                required: true,
                                schema: {
                                    type: "string"
                                }
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Expected response to a valid request",
                                content: {
                                    "application/json": {
                                        schema: {
                                            $ref: "#/components/schemas/Pet"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/owners": {
                    get: {
                        summary: "List all owners",
                        operationId: "listOwners",
                        tags: ["owners"],
                        responses: {
                            "200": {
                                description: "A list of owners",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/Owner"
                                            }
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
                    Pet: {
                        type: "object",
                        required: ["id", "name"],
                        properties: {
                            id: {
                                type: "integer",
                                format: "int64",
                                description: "Unique identifier for the pet"
                            },
                            name: {
                                type: "string",
                                description: "Name of the pet"
                            },
                            tag: {
                                type: "string",
                                description: "Tag for the pet"
                            },
                            owner: {
                                $ref: "#/components/schemas/Owner"
                            }
                        }
                    },
                    NewPet: {
                        type: "object",
                        required: ["name"],
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the pet"
                            },
                            tag: {
                                type: "string",
                                description: "Tag for the pet"
                            }
                        }
                    },
                    Owner: {
                        type: "object",
                        required: ["id", "name"],
                        properties: {
                            id: {
                                type: "integer",
                                format: "int64"
                            },
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string",
                                format: "email"
                            }
                        }
                    }
                }
            }
        };

        const pruner = new OpenAPIPruner({
            document,
            endpoints: [{ path: "/pets", method: "get" }]
        });

        const result = pruner.prune();

        expect(result.document.paths["/pets"]?.get).toBeDefined();
        expect(result.document.paths["/pets"]?.post).toBeUndefined();
        expect(result.document.paths["/pets/{petId}"]).toBeUndefined();
        expect(result.document.paths["/owners"]).toBeUndefined();

        expect(result.document.components?.schemas?.Pet).toBeDefined();
        expect(result.document.components?.schemas?.Owner).toBeDefined();
        expect(result.document.components?.schemas?.NewPet).toBeUndefined();

        expect(result.document.info.title).toBe("Pet Store API");
        expect(result.document.servers).toHaveLength(1);

        expect(result.statistics.originalEndpoints).toBe(4);
        expect(result.statistics.prunedEndpoints).toBe(1);
        expect(result.statistics.originalSchemas).toBe(3);
        expect(result.statistics.prunedSchemas).toBe(2);
    });

    it("should demonstrate pruning with multiple endpoints", () => {
        const document: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: {
                title: "User API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "List users",
                        responses: {
                            "200": {
                                description: "Success",
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
                            }
                        }
                    },
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
                },
                "/users/{userId}": {
                    get: {
                        summary: "Get user",
                        parameters: [
                            {
                                name: "userId",
                                in: "path",
                                required: true,
                                schema: {
                                    type: "string"
                                }
                            }
                        ],
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
                            email: { type: "string", format: "email" }
                        }
                    },
                    CreateUserRequest: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string", format: "email" }
                        },
                        required: ["name", "email"]
                    }
                }
            }
        };

        const pruner = new OpenAPIPruner({
            document,
            endpoints: [{ path: "/users" }]
        });

        const result = pruner.prune();

        expect(result.document.paths["/users"]?.get).toBeDefined();
        expect(result.document.paths["/users"]?.post).toBeDefined();
        expect(result.document.paths["/users/{userId}"]).toBeUndefined();

        expect(result.document.components?.schemas?.User).toBeDefined();
        expect(result.document.components?.schemas?.CreateUserRequest).toBeDefined();
    });
});
