import type { OpenAPISpec } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import { LegacyApiSpecAdapter } from "../api/adapter/LegacyApiSpecAdapter";
import type { AsyncApiSpec } from "../api/config/AsyncApiSpec";
import type { OpenApiSpec } from "../api/config/OpenApiSpec";
import { createTestContext } from "./utils/createTestContext";

describe("LegacyApiSpecAdapter", () => {
    const cwd = AbsoluteFilePath.of("/test/path");
    const context = createTestContext({ cwd });
    const adapter = new LegacyApiSpecAdapter({ context });

    describe("convertOpenApiSettings", () => {
        it("returns undefined when settings are not provided", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml")
            };

            const result = convertOpenApi(spec);
            expect(result.settings).toBeUndefined();
        });

        it("maps base API settings correctly", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    respectNullableSchemas: true,
                    wrapReferencesToNullableInOptional: false,
                    coerceOptionalSchemasToNullable: true,
                    titleAsSchemaName: true,
                    coerceEnumsToLiterals: true,
                    optionalAdditionalProperties: false,
                    idiomaticRequestNames: true,
                    groupEnvironmentsByHost: true
                }
            };

            const result = convertOpenApi(spec);
            expect(result.settings).toBeDefined();
            expect(result.settings?.respectNullableSchemas).toBe(true);
            expect(result.settings?.wrapReferencesToNullableInOptional).toBe(false);
            expect(result.settings?.coerceOptionalSchemasToNullable).toBe(true);
            expect(result.settings?.useTitlesAsName).toBe(true);
            expect(result.settings?.coerceEnumsToLiterals).toBe(true);
            expect(result.settings?.optionalAdditionalProperties).toBe(false);
            expect(result.settings?.shouldUseIdiomaticRequestNames).toBe(true);
            expect(result.settings?.groupEnvironmentsByHost).toBe(true);
        });

        it("maps OpenAPI-specific settings correctly", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    respectReadonlySchemas: true,
                    onlyIncludeReferencedSchemas: true,
                    inlinePathParameters: false,
                    preferUndiscriminatedUnionsWithLiterals: true,
                    objectQueryParameters: false,
                    respectForwardCompatibleEnums: true,
                    useBytesForBinaryResponse: true,
                    additionalPropertiesDefaultsTo: true,
                    typeDatesAsStrings: true,
                    preserveSingleSchemaOneof: true,
                    inlineAllOfSchemas: true,
                    groupMultiApiEnvironments: true
                }
            };

            const result = convertOpenApi(spec);
            expect(result.settings).toBeDefined();
            expect(result.settings?.respectReadonlySchemas).toBe(true);
            expect(result.settings?.onlyIncludeReferencedSchemas).toBe(true);
            expect(result.settings?.inlinePathParameters).toBe(false);
            expect(result.settings?.shouldUseUndiscriminatedUnionsWithLiterals).toBe(true);
            expect(result.settings?.objectQueryParameters).toBe(false);
            expect(result.settings?.respectForwardCompatibleEnums).toBe(true);
            expect(result.settings?.useBytesForBinaryResponse).toBe(true);
            expect(result.settings?.additionalPropertiesDefaultsTo).toBe(true);
            expect(result.settings?.typeDatesAsStrings).toBe(true);
            expect(result.settings?.preserveSingleSchemaOneOf).toBe(true);
            expect(result.settings?.inlineAllOfSchemas).toBe(true);
            expect(result.settings?.groupMultiApiEnvironments).toBe(true);
        });

        it("maps filter settings correctly", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    filter: {
                        endpoints: ["POST /users", "GET /users/{id}"]
                    }
                }
            };

            const result = convertOpenApi(spec);
            expect(result.settings?.filter).toEqual({
                endpoints: ["POST /users", "GET /users/{id}"]
            });
        });

        it("maps exampleGeneration settings with camelCase to kebab-case conversion", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    exampleGeneration: {
                        request: { maxDepth: 3 },
                        response: { maxDepth: 5 }
                    }
                }
            };

            const result = convertOpenApi(spec);
            expect(result.settings?.exampleGeneration).toEqual({
                request: { "max-depth": 3 },
                response: { "max-depth": 5 }
            });
        });

        it("maps resolveAliases boolean correctly", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    resolveAliases: true
                }
            };

            const result = convertOpenApi(spec);
            expect(result.settings?.resolveAliases).toBe(true);
        });

        it("maps resolveAliases object correctly", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    resolveAliases: {
                        except: ["UserId", "OrderId"]
                    }
                }
            };

            const result = convertOpenApi(spec);
            expect(result.settings?.resolveAliases).toEqual({
                except: ["UserId", "OrderId"]
            });
        });

        it("maps defaultFormParameterEncoding correctly", () => {
            const specForm: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    defaultFormParameterEncoding: "form"
                }
            };

            const specJson: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    defaultFormParameterEncoding: "json"
                }
            };

            expect(convertOpenApi(specForm).settings?.defaultFormParameterEncoding).toBe("form");
            expect(convertOpenApi(specJson).settings?.defaultFormParameterEncoding).toBe("json");
        });

        it("maps removeDiscriminantsFromSchemas enum correctly", () => {
            const specAlways: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    removeDiscriminantsFromSchemas: "always"
                }
            };

            const specNever: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    removeDiscriminantsFromSchemas: "never"
                }
            };

            expect(convertOpenApi(specAlways).settings?.removeDiscriminantsFromSchemas).toBe(
                generatorsYml.RemoveDiscriminantsFromSchemas.Always
            );
            expect(convertOpenApi(specNever).settings?.removeDiscriminantsFromSchemas).toBe(
                generatorsYml.RemoveDiscriminantsFromSchemas.Never
            );
        });

        it("maps pathParameterOrder enum correctly", () => {
            const specUrlOrder: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    pathParameterOrder: "url-order"
                }
            };

            const specSpecOrder: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    pathParameterOrder: "spec-order"
                }
            };

            expect(convertOpenApi(specUrlOrder).settings?.pathParameterOrder).toBe(
                generatorsYml.PathParameterOrder.UrlOrder
            );
            expect(convertOpenApi(specSpecOrder).settings?.pathParameterOrder).toBe(
                generatorsYml.PathParameterOrder.SpecOrder
            );
        });

        it("maps defaultIntegerFormat enum correctly", () => {
            const formats = ["int32", "int64", "uint32", "uint64"] as const;
            const expected = [
                generatorsYml.DefaultIntegerFormat.Int32,
                generatorsYml.DefaultIntegerFormat.Int64,
                generatorsYml.DefaultIntegerFormat.Uint32,
                generatorsYml.DefaultIntegerFormat.Uint64
            ];

            formats.forEach((format, index) => {
                const spec: OpenApiSpec = {
                    openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                    settings: {
                        defaultIntegerFormat: format
                    }
                };
                expect(convertOpenApi(spec).settings?.defaultIntegerFormat).toBe(expected[index]);
            });
        });

        it("preserves namespace from spec", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                namespace: "users"
            };

            const result = convertOpenApi(spec);
            expect(result.namespace).toBe("users");
        });

        it("preserves overrides and overlays paths", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                overrides: AbsoluteFilePath.of("/test/path/overrides.yml"),
                overlays: AbsoluteFilePath.of("/test/path/overlays.yml")
            };

            const result = convertOpenApi(spec);
            expect(result.absoluteFilepathToOverrides).toBe("/test/path/overrides.yml");
            expect(result.absoluteFilepathToOverlays).toBe("/test/path/overlays.yml");
        });
    });

    describe("convertAsyncApiSettings", () => {
        it("returns undefined when settings are not provided", () => {
            const spec: AsyncApiSpec = {
                asyncapi: AbsoluteFilePath.of("/test/path/asyncapi.yml")
            };

            const result = convertAsyncApi(spec);
            expect(result.settings).toBeUndefined();
        });

        it("maps base API settings correctly for AsyncAPI", () => {
            const spec: AsyncApiSpec = {
                asyncapi: AbsoluteFilePath.of("/test/path/asyncapi.yml"),
                settings: {
                    respectNullableSchemas: true,
                    coerceEnumsToLiterals: true,
                    titleAsSchemaName: true
                }
            };

            const result = convertAsyncApi(spec);
            expect(result.settings).toBeDefined();
            expect(result.settings?.respectNullableSchemas).toBe(true);
            expect(result.settings?.coerceEnumsToLiterals).toBe(true);
            expect(result.settings?.useTitlesAsName).toBe(true);
        });

        it("maps messageNaming to asyncApiNaming correctly", () => {
            const specV1: AsyncApiSpec = {
                asyncapi: AbsoluteFilePath.of("/test/path/asyncapi.yml"),
                settings: {
                    messageNaming: "v1"
                }
            };

            const specV2: AsyncApiSpec = {
                asyncapi: AbsoluteFilePath.of("/test/path/asyncapi.yml"),
                settings: {
                    messageNaming: "v2"
                }
            };

            expect(convertAsyncApi(specV1).settings?.asyncApiNaming).toBe("v1");
            expect(convertAsyncApi(specV2).settings?.asyncApiNaming).toBe("v2");
        });

        it("preserves namespace from AsyncAPI spec", () => {
            const spec: AsyncApiSpec = {
                asyncapi: AbsoluteFilePath.of("/test/path/asyncapi.yml"),
                namespace: "events"
            };

            const result = convertAsyncApi(spec);
            expect(result.namespace).toBe("events");
        });
    });

    describe("convertAll", () => {
        it("converts multiple specs", () => {
            const specs: OpenApiSpec[] = [
                {
                    openapi: AbsoluteFilePath.of("/test/path/openapi1.yml"),
                    settings: { respectNullableSchemas: true }
                },
                {
                    openapi: AbsoluteFilePath.of("/test/path/openapi2.yml"),
                    settings: { coerceEnumsToLiterals: true }
                }
            ];

            const results = adapter.convertAll(specs);
            expect(results).toHaveLength(2);

            const result0 = results[0] as OpenAPISpec;
            const result1 = results[1] as OpenAPISpec;
            expect(result0.settings?.respectNullableSchemas).toBe(true);
            expect(result1.settings?.coerceEnumsToLiterals).toBe(true);
        });
    });

    function convertOpenApi(spec: OpenApiSpec): OpenAPISpec {
        const result = adapter.adapt(spec);
        return result as OpenAPISpec;
    }

    function convertAsyncApi(spec: AsyncApiSpec): OpenAPISpec {
        const result = adapter.adapt(spec);
        return result as OpenAPISpec;
    }
});
