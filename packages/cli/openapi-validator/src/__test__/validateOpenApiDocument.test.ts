import type { Logger } from "@fern-api/logger";
import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { validateOpenApiDocument } from "../validateOpenApiDocument";

const createMockLogger = (): Logger =>
    ({
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {}
    }) as Logger;

describe("validateOpenApiDocument", () => {
    it("should validate a minimal valid OpenAPI 3.2 document", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {}
        };

        const violations = validateOpenApiDocument(document, createMockLogger());
        expect(violations).toHaveLength(0);
    });

    it("should detect missing info object", () => {
        const document = {
            openapi: "3.1.0",
            paths: {}
        } as unknown as OpenAPIV3_1.Document;

        const violations = validateOpenApiDocument(document, createMockLogger());
        const infoViolations = violations.filter((v) => v.message.includes("info"));
        expect(infoViolations.length).toBeGreaterThan(0);
    });

    it("should detect missing title in info", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "",
                version: "1.0.0"
            },
            paths: {}
        };

        const violations = validateOpenApiDocument(document, createMockLogger());
        const titleViolations = violations.filter((v) => v.message.includes("title"));
        expect(titleViolations.length).toBeGreaterThan(0);
    });

    it("should detect invalid OpenAPI version", () => {
        const document = {
            openapi: "3.0.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {}
        } as unknown as OpenAPIV3_1.Document;

        const violations = validateOpenApiDocument(document, createMockLogger());
        const versionViolations = violations.filter((v) => v.message.includes("3.1"));
        expect(versionViolations.length).toBeGreaterThan(0);
    });

    it("should detect invalid path format", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "invalid-path": {}
            }
        };

        const violations = validateOpenApiDocument(document, createMockLogger());
        const pathViolations = violations.filter((v) => v.message.includes("forward slash"));
        expect(pathViolations.length).toBeGreaterThan(0);
    });

    it("should detect missing responses in operation", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/test": {
                    get: {
                        description: "Test endpoint"
                    } as any
                }
            }
        };

        const violations = validateOpenApiDocument(document, createMockLogger());
        const responseViolations = violations.filter((v) => v.message.includes("responses"));
        expect(responseViolations.length).toBeGreaterThan(0);
    });

    it("should detect invalid parameter", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/test": {
                    get: {
                        parameters: [
                            {
                                name: "",
                                in: "query"
                            } as any
                        ],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            }
        };

        const violations = validateOpenApiDocument(document, createMockLogger());
        const paramViolations = violations.filter((v) => v.message.includes("Parameter"));
        expect(paramViolations.length).toBeGreaterThan(0);
    });

    it("should detect undefined reference", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {
                "/test": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            $ref: "#/components/schemas/NonExistent"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        const violations = validateOpenApiDocument(document, createMockLogger());
        const refViolations = violations.filter((v) => v.message.includes("non-existent"));
        expect(refViolations.length).toBeGreaterThan(0);
    });

    it("should validate server URLs", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            servers: [
                {
                    url: ""
                }
            ],
            paths: {}
        };

        const violations = validateOpenApiDocument(document, createMockLogger());
        const serverViolations = violations.filter((v) => v.message.includes("Server"));
        expect(serverViolations.length).toBeGreaterThan(0);
    });

    it("should validate security schemes", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: {
                title: "Test API",
                version: "1.0.0"
            },
            paths: {},
            components: {
                securitySchemes: {
                    apiKey: {
                        type: "apiKey",
                        name: "",
                        in: "header"
                    }
                }
            }
        };

        const violations = validateOpenApiDocument(document, createMockLogger());
        const securityViolations = violations.filter((v) => v.message.includes("security"));
        expect(securityViolations.length).toBeGreaterThan(0);
    });
});
