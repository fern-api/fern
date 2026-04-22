import { ErrorCollector } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { OpenAPIConverter } from "../OpenAPIConverter.js";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1.js";

function createContext(
    spec: OpenAPIV3_1.Document,
    // biome-ignore lint/suspicious/noExplicitAny: test helper
    authOverrides?: any
) {
    return new OpenAPIConverterContext3_1({
        spec,
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        settings: {} as any,
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        errorCollector: new ErrorCollector({ logger: undefined as any }),
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        logger: undefined as any,
        generationLanguage: undefined,
        smartCasing: false,
        exampleGenerationArgs: { disabled: false },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        authOverrides
    });
}

describe("Auth scheme description enrichment", () => {
    it("should preserve OpenAPI description when generators.yml has no docs", async () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    BasicAuth: {
                        type: "http",
                        scheme: "basic",
                        description: "Use your API key as username"
                    }
                }
            },
            security: [{ BasicAuth: [] }]
        };

        const context = createContext(spec, {
            "auth-schemes": {
                BasicAuth: {
                    scheme: "basic",
                    username: { name: "API_KEY" }
                }
            },
            auth: "BasicAuth"
        });

        const converter = new OpenAPIConverter({
            breadcrumbs: [],
            context,
            audiences: { type: "all" }
        });

        const ir = await converter.convert();

        expect(ir.auth.schemes).toHaveLength(1);
        expect(ir.auth.schemes[0]?.docs).toBe("Use your API key as username");
    });

    it("should preserve user docs from generators.yml over OpenAPI description", async () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    BasicAuth: {
                        type: "http",
                        scheme: "basic",
                        description: "OpenAPI description"
                    }
                }
            },
            security: [{ BasicAuth: [] }]
        };

        const context = createContext(spec, {
            "auth-schemes": {
                BasicAuth: {
                    scheme: "basic",
                    docs: "User custom docs",
                    username: { name: "API_KEY" }
                }
            },
            auth: "BasicAuth"
        });

        const converter = new OpenAPIConverter({
            breadcrumbs: [],
            context,
            audiences: { type: "all" }
        });

        const ir = await converter.convert();

        expect(ir.auth.schemes).toHaveLength(1);
        expect(ir.auth.schemes[0]?.docs).toBe("User custom docs");
    });

    it("should handle auth scheme in generators.yml but not in OpenAPI", async () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key",
                        description: "Different scheme"
                    }
                }
            }
        };

        const context = createContext(spec, {
            "auth-schemes": {
                BasicAuth: {
                    scheme: "basic",
                    username: { name: "API_KEY" }
                }
            },
            auth: "BasicAuth"
        });

        const converter = new OpenAPIConverter({
            breadcrumbs: [],
            context,
            audiences: { type: "all" }
        });

        const ir = await converter.convert();

        expect(ir.auth.schemes).toHaveLength(1);
        expect(ir.auth.schemes[0]?.docs).toBeUndefined();
    });

    it("should handle multiple auth schemes with mixed docs", async () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    BasicAuth: {
                        type: "http",
                        scheme: "basic",
                        description: "Basic auth description"
                    },
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        description: "Bearer auth description"
                    }
                }
            },
            security: [{ BasicAuth: [] }, { BearerAuth: [] }]
        };

        const context = createContext(spec, {
            "auth-schemes": {
                BasicAuth: {
                    scheme: "basic",
                    docs: "Custom basic docs"
                },
                BearerAuth: {
                    scheme: "bearer"
                }
            },
            auth: { any: ["BasicAuth", "BearerAuth"] }
        });

        const converter = new OpenAPIConverter({
            breadcrumbs: [],
            context,
            audiences: { type: "all" }
        });

        const ir = await converter.convert();

        expect(ir.auth.schemes).toHaveLength(2);

        const basicScheme = ir.auth.schemes.find((s) => s.key === "BasicAuth");
        expect(basicScheme?.docs).toBe("Custom basic docs");

        const bearerScheme = ir.auth.schemes.find((s) => s.key === "BearerAuth");
        expect(bearerScheme?.docs).toBe("Bearer auth description");
    });

    it("should handle OpenAPI auth without generators.yml override", async () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    BasicAuth: {
                        type: "http",
                        scheme: "basic",
                        description: "Basic auth description"
                    }
                }
            },
            security: [{ BasicAuth: [] }]
        };

        const context = createContext(spec);

        const converter = new OpenAPIConverter({
            breadcrumbs: [],
            context,
            audiences: { type: "all" }
        });

        const ir = await converter.convert();

        expect(ir.auth.schemes).toHaveLength(1);
        expect(ir.auth.schemes[0]?.docs).toBe("Basic auth description");
    });
});
