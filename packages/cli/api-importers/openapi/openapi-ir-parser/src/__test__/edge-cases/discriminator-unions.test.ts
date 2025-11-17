import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertForTest } from "./testUtils";

describe("discriminator unions", () => {
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

    it("should handle discriminator with explicit mapping", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Animal: {
                        oneOf: [
                            { $ref: "#/components/schemas/Dog" },
                            { $ref: "#/components/schemas/Cat" },
                            { $ref: "#/components/schemas/Bird" }
                        ],
                        discriminator: {
                            propertyName: "animalType",
                            mapping: {
                                dog: "#/components/schemas/Dog",
                                cat: "#/components/schemas/Cat",
                                bird: "#/components/schemas/Bird"
                            }
                        }
                    },
                    Dog: {
                        type: "object",
                        properties: {
                            animalType: { type: "string", enum: ["dog"] },
                            breed: { type: "string" },
                            barkVolume: { type: "number" }
                        },
                        required: ["animalType", "breed"]
                    },
                    Cat: {
                        type: "object",
                        properties: {
                            animalType: { type: "string", enum: ["cat"] },
                            color: { type: "string" },
                            indoor: { type: "boolean" }
                        },
                        required: ["animalType"]
                    },
                    Bird: {
                        type: "object",
                        properties: {
                            animalType: { type: "string", enum: ["bird"] },
                            wingspan: { type: "number" },
                            canFly: { type: "boolean" }
                        },
                        required: ["animalType", "canFly"]
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

        const schema = openApiDocument.components?.schemas?.Animal as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Animal"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("oneOf");
    });

    it("should handle discriminator without explicit mapping", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Shape: {
                        oneOf: [{ $ref: "#/components/schemas/Circle" }, { $ref: "#/components/schemas/Square" }],
                        discriminator: {
                            propertyName: "shapeType"
                        }
                    },
                    Circle: {
                        type: "object",
                        properties: {
                            shapeType: { type: "string" },
                            radius: { type: "number" }
                        },
                        required: ["shapeType", "radius"]
                    },
                    Square: {
                        type: "object",
                        properties: {
                            shapeType: { type: "string" },
                            sideLength: { type: "number" }
                        },
                        required: ["shapeType", "sideLength"]
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

        const schema = openApiDocument.components?.schemas?.Shape as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Shape"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("oneOf");
    });

    it("should handle discriminator nested under allOf", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    BaseEntity: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            createdAt: { type: "string", format: "date-time" }
                        },
                        required: ["id"]
                    },
                    Entity: {
                        allOf: [
                            { $ref: "#/components/schemas/BaseEntity" },
                            {
                                oneOf: [
                                    { $ref: "#/components/schemas/UserEntity" },
                                    { $ref: "#/components/schemas/ProductEntity" }
                                ],
                                discriminator: {
                                    propertyName: "entityType"
                                }
                            }
                        ]
                    },
                    UserEntity: {
                        type: "object",
                        properties: {
                            entityType: { type: "string", enum: ["user"] },
                            username: { type: "string" },
                            email: { type: "string" }
                        },
                        required: ["entityType", "username"]
                    },
                    ProductEntity: {
                        type: "object",
                        properties: {
                            entityType: { type: "string", enum: ["product"] },
                            name: { type: "string" },
                            price: { type: "number" }
                        },
                        required: ["entityType", "name"]
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

        const schema = openApiDocument.components?.schemas?.Entity as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Entity"] });

        expect(result).toBeDefined();
    });

    it("should handle discriminator with title property", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Event: {
                        oneOf: [
                            { $ref: "#/components/schemas/ClickEvent" },
                            { $ref: "#/components/schemas/ViewEvent" }
                        ],
                        discriminator: {
                            propertyName: "eventType"
                        }
                    },
                    ClickEvent: {
                        title: "Click Event",
                        type: "object",
                        properties: {
                            eventType: { type: "string", enum: ["click"] },
                            x: { type: "number" },
                            y: { type: "number" }
                        },
                        required: ["eventType"]
                    },
                    ViewEvent: {
                        title: "View Event",
                        type: "object",
                        properties: {
                            eventType: { type: "string", enum: ["view"] },
                            duration: { type: "number" }
                        },
                        required: ["eventType"]
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

        const schema = openApiDocument.components?.schemas?.Event as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Event"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("oneOf");
    });

    it("should handle discriminator with complex variant types", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Payment: {
                        oneOf: [
                            { $ref: "#/components/schemas/CreditCardPayment" },
                            { $ref: "#/components/schemas/BankTransferPayment" },
                            { $ref: "#/components/schemas/CryptoPayment" }
                        ],
                        discriminator: {
                            propertyName: "paymentMethod"
                        }
                    },
                    CreditCardPayment: {
                        type: "object",
                        properties: {
                            paymentMethod: { type: "string", enum: ["credit_card"] },
                            cardNumber: { type: "string" },
                            expiryDate: { type: "string" },
                            cvv: { type: "string" }
                        },
                        required: ["paymentMethod", "cardNumber"]
                    },
                    BankTransferPayment: {
                        type: "object",
                        properties: {
                            paymentMethod: { type: "string", enum: ["bank_transfer"] },
                            accountNumber: { type: "string" },
                            routingNumber: { type: "string" },
                            bankName: { type: "string" }
                        },
                        required: ["paymentMethod", "accountNumber"]
                    },
                    CryptoPayment: {
                        type: "object",
                        properties: {
                            paymentMethod: { type: "string", enum: ["crypto"] },
                            walletAddress: { type: "string" },
                            currency: { type: "string", enum: ["BTC", "ETH", "USDT"] },
                            network: { type: "string" }
                        },
                        required: ["paymentMethod", "walletAddress", "currency"]
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

        const schema = openApiDocument.components?.schemas?.Payment as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Payment"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("oneOf");
    });
});
