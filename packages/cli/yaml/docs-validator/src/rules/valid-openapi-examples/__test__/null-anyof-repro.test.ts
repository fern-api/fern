import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { Logger } from "@fern-api/logger";
import { OpenAPIConverterContext3_1 } from "@fern-api/openapi-to-ir";
import { ErrorCollector, ExampleValidator } from "@fern-api/v3-importer-commons";
import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";

const logger: Logger = {
    disable: vi.fn(),
    enable: vi.fn(),
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
};

describe("null anyOf validation with real context", () => {
    it("should validate null example in anyOf with real OpenAPIConverterContext3_1", () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {
                "/saved_search/": {
                    post: {
                        operationId: "createSavedSearch",
                        responses: {
                            "200": {
                                description: "OK",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/SavedSearch" },
                                        examples: {
                                            contactSmartView: {
                                                value: {
                                                    id: "save_abc123",
                                                    name: "Test Search",
                                                    query: null
                                                }
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
                    SavedSearch: {
                        title: "SavedSearch",
                        type: "object",
                        properties: {
                            id: { title: "ID", type: "string" },
                            name: { title: "Name", type: "string" },
                            query: {
                                title: "Query",
                                anyOf: [{ type: "string" }, { type: "null" }]
                            }
                        },
                        required: ["id", "name", "query"]
                    }
                }
            }
        };

        const errorCollector = new ErrorCollector({ logger });
        const converterContext = new OpenAPIConverterContext3_1({
            namespace: undefined,
            generationLanguage: "typescript",
            logger,
            smartCasing: false,
            spec,
            exampleGenerationArgs: { disabled: false },
            errorCollector,
            enableUniqueErrorsPerEndpoint: false,
            generateV1Examples: false,
            settings: getOpenAPISettings()
        });

        const validator = new ExampleValidator({ context: converterContext });
        const result = validator.validateHumanExamples({ spec });

        console.log("Total examples:", result.totalExamples);
        console.log("Valid:", result.validExamples);
        console.log("Invalid:", result.invalidExamples);
        for (const invalid of result.invalidHumanExamples) {
            console.log(`Invalid: ${invalid.method} ${invalid.endpointPath} (${invalid.exampleName})`);
            for (const error of invalid.errors) {
                console.log(`  Error: ${error.message}`);
                console.log(`  Path: ${JSON.stringify(error.path)}`);
            }
        }

        expect(result.invalidExamples).toBe(0);
        expect(result.validExamples).toBe(1);
    });
});
