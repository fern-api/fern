import { applyOpenAPIOverlay } from "../applyOpenAPIOverlay";

describe("applyOpenAPIOverlay", () => {
    it("should merge updates into a schema at a JSONPath target", () => {
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

    it("should ignore updates if remove is true", () => {
        const data = {
            components: {
                schemas: {
                    User: {
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
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.User.properties.email",
                    description: "Remove email property",
                    update: {
                        type: "string",
                        format: "email"
                    },
                    remove: true
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
                                type: "string"
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle multiple consecutive array removals", () => {
        // If an array query matches multiple items, each removal will
        // change the size of the array. Ensure that subsequent removals
        // don't rely on indices that have shifted.
        const data = {
            paths: {
                "/users": {
                    get: {
                        parameters: [
                            { name: "id", in: "query", required: true },
                            { name: "limit", in: "query", required: false },
                            { name: "offset", in: "query", required: false },
                            { name: "sort", in: "query", required: false }
                        ]
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.paths['/users'].get.parameters[?(@.name == 'limit')]",
                    description: "Remove limit parameter",
                    update: {},
                    remove: true
                },
                {
                    target: "$.paths['/users'].get.parameters[?(@.name == 'offset')]",
                    description: "Remove offset parameter",
                    update: {},
                    remove: true
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
                            { name: "id", in: "query", required: true },
                            { name: "sort", in: "query", required: false }
                        ]
                    }
                }
            }
        });
    });

    it("should handle merges to multiple items in an array", () => {
        const data = {
            paths: {
                "/users": {
                    get: {
                        parameters: [
                            { name: "id", in: "query", required: true },
                            { name: "limit", in: "query", required: false },
                            { name: "authorization", in: "header", required: true },
                            { name: "offset", in: "query", required: false },
                            { name: "sort", in: "query", required: false }
                        ]
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.paths['/users'].get.parameters[?(@.in == 'query')]",
                    description: "Add description to all query parameters",
                    update: {
                        description: "Query parameter"
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
                            { name: "id", in: "query", required: true, description: "Query parameter" },
                            { name: "limit", in: "query", required: false, description: "Query parameter" },
                            { name: "authorization", in: "header", required: true },
                            { name: "offset", in: "query", required: false, description: "Query parameter" },
                            { name: "sort", in: "query", required: false, description: "Query parameter" }
                        ]
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

    it("should handle actions on items inserted by earlier actions", () => {
        // Spec requirement: "Actions execute sequentially; each operates on the previous result"
        // Verify that action 2 can target elements added by action 1
        const data = {
            components: {
                schemas: {
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
                    target: "$.components.schemas.User",
                    description: "Add profile property to User schema",
                    update: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string"
                            },
                            profile: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string"
                                    }
                                }
                            }
                        }
                    },
                    remove: false
                },
                {
                    target: "$.components.schemas.User.properties.profile",
                    description: "Add email property to the profile object that was just added",
                    update: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string",
                                format: "email"
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
                            id: {
                                type: "string"
                            },
                            profile: {
                                type: "object",
                                properties: {
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
                }
            }
        });
    });

    it("should handle wildcard path matching across multiple paths", () => {
        // Spec requirement: JSONPath expressions support wildcards like $.paths.*.get
        const data = {
            paths: {
                "/users": {
                    get: {
                        summary: "Get users",
                        operationId: "getUsers"
                    },
                    post: {
                        summary: "Create user",
                        operationId: "createUser"
                    }
                },
                "/posts": {
                    get: {
                        summary: "Get posts",
                        operationId: "getPosts"
                    }
                },
                "/comments": {
                    get: {
                        summary: "Get comments",
                        operationId: "getComments"
                    },
                    delete: {
                        summary: "Delete comment",
                        operationId: "deleteComment"
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.paths.*.get",
                    description: "Add security requirement to all GET operations",
                    update: {
                        security: [
                            {
                                Bearer: []
                            }
                        ]
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
                        summary: "Get users",
                        operationId: "getUsers",
                        security: [
                            {
                                Bearer: []
                            }
                        ]
                    },
                    post: {
                        summary: "Create user",
                        operationId: "createUser"
                    }
                },
                "/posts": {
                    get: {
                        summary: "Get posts",
                        operationId: "getPosts",
                        security: [
                            {
                                Bearer: []
                            }
                        ]
                    }
                },
                "/comments": {
                    get: {
                        summary: "Get comments",
                        operationId: "getComments",
                        security: [
                            {
                                Bearer: []
                            }
                        ]
                    },
                    delete: {
                        summary: "Delete comment",
                        operationId: "deleteComment"
                    }
                }
            }
        });
    });

    it("should handle zero-match JSONPath expressions", () => {
        // Spec requirement: JSONPath expressions can select zero matches without error
        const data = {
            components: {
                schemas: {
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
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users"
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.NonExistentSchema",
                    description: "Try to update a schema that doesn't exist",
                    update: {
                        type: "object",
                        properties: {
                            someProperty: {
                                type: "string"
                            }
                        }
                    },
                    remove: false
                },
                {
                    target: "$.paths['/nonexistent'].post",
                    description: "Try to update an operation that doesn't exist",
                    update: {
                        summary: "Non-existent operation"
                    },
                    remove: false
                },
                {
                    target: "$.components.schemas.User",
                    description: "This action should still execute normally after the non-matching ones",
                    update: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string"
                            },
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string",
                                format: "email"
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

        // The document should remain mostly unchanged except for the valid action
        expect(result).toEqual({
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string"
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
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users"
                    }
                }
            }
        });
    });

    it("should handle deep merge behavior", () => {
        // Spec requirement: "Properties in update recursively merge with target object properties"
        const data = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            profile: {
                                type: "object",
                                properties: {
                                    personal: {
                                        type: "object",
                                        properties: {
                                            name: {
                                                type: "string"
                                            },
                                            age: {
                                                type: "integer"
                                            }
                                        }
                                    },
                                    contact: {
                                        type: "object",
                                        properties: {
                                            phone: {
                                                type: "string"
                                            }
                                        }
                                    }
                                }
                            },
                            settings: {
                                type: "object",
                                properties: {
                                    theme: {
                                        type: "string",
                                        default: "light"
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
                    target: "$.components.schemas.User.properties.profile",
                    description:
                        "Deep merge into profile - should preserve existing nested structure while adding new properties",
                    update: {
                        type: "object",
                        properties: {
                            personal: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string"
                                    },
                                    // Add bio, keep existing age
                                    bio: {
                                        type: "string"
                                    }
                                }
                            },
                            contact: {
                                type: "object",
                                properties: {
                                    // Keep existing phone, add email
                                    phone: {
                                        type: "string"
                                    },
                                    email: {
                                        type: "string",
                                        format: "email"
                                    }
                                }
                            },
                            // Add new top-level property
                            preferences: {
                                type: "object",
                                properties: {
                                    newsletter: {
                                        type: "boolean",
                                        default: false
                                    }
                                }
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
                            profile: {
                                type: "object",
                                properties: {
                                    personal: {
                                        type: "object",
                                        properties: {
                                            name: {
                                                type: "string"
                                            },
                                            age: {
                                                type: "integer"
                                            },
                                            bio: {
                                                type: "string"
                                            }
                                        }
                                    },
                                    contact: {
                                        type: "object",
                                        properties: {
                                            phone: {
                                                type: "string"
                                            },
                                            email: {
                                                type: "string",
                                                format: "email"
                                            }
                                        }
                                    },
                                    preferences: {
                                        type: "object",
                                        properties: {
                                            newsletter: {
                                                type: "boolean",
                                                default: false
                                            }
                                        }
                                    }
                                }
                            },
                            settings: {
                                type: "object",
                                properties: {
                                    theme: {
                                        type: "string",
                                        default: "light"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle root-level targeting", () => {
        // Spec requirement: Actions can target the root document with $
        // Check adding/updating top-level properties and removing top-level properties
        const data = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users"
                    }
                }
            },
            tags: [
                {
                    name: "legacy",
                    description: "Legacy endpoints"
                }
            ],
            components: {
                securitySchemes: {
                    apiKey: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key"
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$",
                    description: "Add servers and modify info at root level",
                    update: {
                        openapi: "3.0.0",
                        info: {
                            title: "Test API",
                            version: "1.0.0",
                            description: "A comprehensive API for testing overlay functionality",
                            contact: {
                                name: "API Team",
                                email: "api@example.com"
                            }
                        },
                        servers: [
                            {
                                url: "https://api.example.com/v1",
                                description: "Production server"
                            },
                            {
                                url: "https://staging-api.example.com/v1",
                                description: "Staging server"
                            }
                        ],
                        externalDocs: {
                            description: "Find more info here",
                            url: "https://docs.example.com"
                        }
                    },
                    remove: false
                },
                {
                    target: "$.tags",
                    description: "Remove tags top-level property",
                    update: {},
                    remove: true
                },
                {
                    target: "$.components",
                    description: "Remove components top-level property",
                    update: {},
                    remove: true
                }
            ]
        };

        const result = applyOpenAPIOverlay({
            data,
            overlay
        });

        expect(result).toEqual({
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0",
                description: "A comprehensive API for testing overlay functionality",
                contact: {
                    name: "API Team",
                    email: "api@example.com"
                }
            },
            paths: {
                "/users": {
                    get: {
                        summary: "Get users"
                    }
                }
            },
            servers: [
                {
                    url: "https://api.example.com/v1",
                    description: "Production server"
                },
                {
                    url: "https://staging-api.example.com/v1",
                    description: "Staging server"
                }
            ],
            externalDocs: {
                description: "Find more info here",
                url: "https://docs.example.com"
            }
        });
    });

    it("should handle array edge cases including empty arrays and replacing complete arrays", () => {
        // Primitive-valued items of an array cannot be replaced or removed individually, only the complete array can be replaced
        // Test appending to empty arrays and replacing complete primitive arrays
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
                                enum: [] // Empty array
                            },
                            permissions: {
                                type: "array",
                                items: {
                                    type: "string"
                                },
                                enum: ["read"]
                            },
                            roles: {
                                type: "array",
                                items: {
                                    type: "object"
                                },
                                enum: [] // Empty object array
                            }
                        }
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$.components.schemas.User.properties.tags",
                    description: "Replace complete primitive array (was empty)",
                    update: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        enum: ["tag1", "tag2"]
                    },
                    remove: false
                },
                {
                    target: "$.components.schemas.User.properties.permissions",
                    description: "Replace complete primitive array (had existing values)",
                    update: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        enum: ["read", "write", "admin"]
                    },
                    remove: false
                },
                {
                    target: "$.components.schemas.User.properties.roles.enum",
                    description: "Append object to empty object array",
                    update: { name: "admin", level: 1 },
                    remove: false
                },
                {
                    target: "$.components.schemas.User.properties.roles.enum",
                    description: "Append another object to the array",
                    update: { name: "user", level: 2 },
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
                                enum: ["tag1", "tag2"]
                            },
                            permissions: {
                                type: "array",
                                items: {
                                    type: "string"
                                },
                                enum: ["read", "write", "admin"]
                            },
                            roles: {
                                type: "array",
                                items: {
                                    type: "object"
                                },
                                enum: [
                                    { name: "admin", level: 1 },
                                    { name: "user", level: 2 }
                                ]
                            }
                        }
                    }
                }
            }
        });
    });

    it("should handle complex JSONPath expressions including recursive descent and filters", () => {
        // Spec requirement: Support for advanced JSONPath features
        // Test recursive descent, filter conditions, and index-based selection
        const data = {
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string"
                            },
                            address: {
                                type: "object",
                                properties: {
                                    street: {
                                        type: "string"
                                    }
                                }
                            }
                        }
                    },
                    Product: {
                        type: "object",
                        properties: {
                            title: {
                                type: "string"
                            },
                            metadata: {
                                type: "object",
                                properties: {
                                    tags: {
                                        type: "array",
                                        items: {
                                            type: "object"
                                        },
                                        enum: [
                                            { name: "featured", active: true },
                                            { name: "sale", active: false },
                                            { name: "new", active: true }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            paths: {
                "/users": {
                    get: {
                        parameters: [
                            { name: "limit", in: "query", schema: { type: "integer" } },
                            { name: "offset", in: "query", schema: { type: "integer" } }
                        ]
                    }
                }
            }
        };

        const overlay = {
            actions: [
                {
                    target: "$..properties[?(@.type == 'string')]",
                    description: "Use recursive descent to find all string type properties and add format validation",
                    update: {
                        type: "string",
                        minLength: 1
                    },
                    remove: false
                },
                {
                    target: "$.components.schemas.Product.properties.metadata.properties.tags.enum[?(@.active == true)]",
                    description: "Filter array items by property value",
                    update: {
                        priority: "high"
                    },
                    remove: false
                },
                {
                    target: "$.paths['/users'].get.parameters[0]",
                    description: "Target specific array index",
                    update: {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100 },
                        description: "Maximum number of items to return"
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
                                minLength: 1
                            },
                            address: {
                                type: "object",
                                properties: {
                                    street: {
                                        type: "string",
                                        minLength: 1
                                    }
                                }
                            }
                        }
                    },
                    Product: {
                        type: "object",
                        properties: {
                            title: {
                                type: "string",
                                minLength: 1
                            },
                            metadata: {
                                type: "object",
                                properties: {
                                    tags: {
                                        type: "array",
                                        items: {
                                            type: "object"
                                        },
                                        enum: [
                                            { name: "featured", active: true, priority: "high" },
                                            { name: "sale", active: false },
                                            { name: "new", active: true, priority: "high" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            paths: {
                "/users": {
                    get: {
                        parameters: [
                            {
                                name: "limit",
                                in: "query",
                                schema: { type: "integer", minimum: 1, maximum: 100 },
                                description: "Maximum number of items to return"
                            },
                            { name: "offset", in: "query", schema: { type: "integer" } }
                        ]
                    }
                }
            }
        });
    });
});
