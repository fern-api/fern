import { applyOpenAPIOverlay } from "../applyOpenAPIOverlay";

describe("applyOpenAPIOverlay", () => {
    it.only("should merge updates into a schema at a JSONPath target", () => {
        const data = {
            components: {
                schemas: {
                    UserUpdate: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string",
                                nullable: true
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.UserUpdate",
                    description: "Add lastName property to UserUpdate schema",
                    update: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            lastName: {
                                type: "string"
                            },
                            email: {
                                type: "string",
                                nullable: true
                            }
                        }
                    },
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            components: {
                schemas: {
                    UserUpdate: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            lastName: {
                                type: "string"
                            },
                            email: {
                                type: "string",
                                nullable: true
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle schema with null examples", () => {
        const data = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                examples: {
                                    example1: null,
                                    example2: null
                                }
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.User.properties.name",
                    description: "Update name property examples",
                    update: {
                        type: "string",
                        examples: {
                            example1: null,
                            example2: null
                        }
                    },
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                examples: {
                                    example1: null,
                                    example2: null
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    it("should merge arrays of objects in OpenAPI paths", () => {
        const data = {
            paths: {
                "/users": {
                    get: {
                        parameters: [
                            { name: "id", in: "query", required: true },
                            { name: "limit", in: "query", required: false }
                        ]
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.paths['/users'].get.parameters[?(@.name=='id')]",
                    description: "Update id parameter",
                    update: {
                        name: "id",
                        in: "query",
                        required: true,
                        description: "User ID"
                    },
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            paths: {
                "/users": {
                    get: {
                        parameters: [
                            { name: "id", in: "query", required: true, description: "User ID" },
                            { name: "limit", in: "query", required: false }
                        ]
                    }
                }
            }
        });
    });

    it("should replace arrays of primitives", () => {
        const data = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            tags: {
                                type: "array",
                                items: {
                                    type: "string"
                                },
                                enum: ["tag1", "tag2"]
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.User.properties.tags.enum",
                    description: "Replace tags enum values",
                    update: ["tag3", "tag4"],
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            tags: {
                                type: "array",
                                items: {
                                    type: "string"
                                },
                                enum: ["tag3", "tag4"]
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle nested object merging in OpenAPI components", () => {
        const data = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            config: {
                                type: "object",
                                properties: {
                                    settings: {
                                        type: "object",
                                        properties: {
                                            theme: {
                                                type: "string",
                                                enum: ["light"]
                                            },
                                            notifications: {
                                                type: "boolean",
                                                default: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.User.properties.config.properties.settings",
                    description: "Update settings properties",
                    update: {
                        type: "object",
                        properties: {
                            theme: {
                                type: "string",
                                enum: ["dark"]
                            },
                            sound: {
                                type: "boolean",
                                default: false
                            }
                        }
                    },
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            config: {
                                type: "object",
                                properties: {
                                    settings: {
                                        type: "object",
                                        properties: {
                                            theme: {
                                                type: "string",
                                                enum: ["dark"]
                                            },
                                            notifications: {
                                                type: "boolean",
                                                default: true
                                            },
                                            sound: {
                                                type: "boolean",
                                                default: false
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle multiple overlay actions", () => {
        const data = {
            components: {
                schemas: {
                    UserUpdate: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            }
                        }
                    },
                    User: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.UserUpdate",
                    description: "Add email to UserUpdate",
                    update: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string"
                            }
                        }
                    },
                    remove: false
                },
                {
                    target: "$.components.schemas.User",
                    description: "Add name to User",
                    update: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string"
                            },
                            name: {
                                type: "string"
                            }
                        }
                    },
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            components: {
                schemas: {
                    UserUpdate: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string"
                            }
                        }
                    },
                    User: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string"
                            },
                            name: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle updating requestBody content schema", () => {
        const data = {
            paths: {
                "/users": {
                    post: {
                        summary: "Create a user",
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            name: {
                                                type: "string"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.paths['/users'].post.requestBody.content['application/json'].schema",
                    description: "Add email property to request body schema",
                    update: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string"
                            }
                        }
                    },
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            paths: {
                "/users": {
                    post: {
                        summary: "Create a user",
                        requestBody: {
                            required: true,
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            name: {
                                                type: "string"
                                            },
                                            email: {
                                                type: "string"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle updating response schemas", () => {
        const data = {
            paths: {
                "/users": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.paths['/users'].get.responses['200'].content['application/json'].schema",
                    description: "Add name property to response schema",
                    update: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string"
                            },
                            name: {
                                type: "string"
                            }
                        }
                    },
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            paths: {
                "/users": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string"
                                                },
                                                name: {
                                                    type: "string"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle updating enum values in schema properties", () => {
        const data = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            status: {
                                type: "string",
                                enum: ["active", "suspended", "deleted"]
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.User.properties.status",
                    description: "Add inactive to status enum",
                    update: {
                        type: "string",
                        enum: ["active", "suspended", "deleted", "inactive"],
                        nullable: true
                    },
                    remove: false
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            status: {
                                type: "string",
                                enum: ["active", "suspended", "deleted", "inactive"],
                                nullable: true
                            }
                        }
                    }
                }
            }
        });
    });
});

