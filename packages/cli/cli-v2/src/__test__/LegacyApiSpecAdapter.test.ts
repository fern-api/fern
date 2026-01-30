import type { OpenAPISpec, OpenRPCSpec } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import { LegacyApiSpecAdapter } from "../api/adapter/LegacyApiSpecAdapter";
import type { AsyncApiSpec } from "../api/config/AsyncApiSpec";
import type { OpenApiSpec } from "../api/config/OpenApiSpec";
import type { OpenRpcSpec } from "../api/config/OpenRpcSpec";
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
                    pathParameterOrder: "urlOrder"
                }
            };

            const specSpecOrder: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    pathParameterOrder: "specOrder"
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

    describe("convertOpenRpcSpec", () => {
        it("converts OpenRPC spec with minimal configuration", () => {
            const spec: OpenRpcSpec = {
                openrpc: AbsoluteFilePath.of("/test/path/openrpc.json")
            };

            const result = convertOpenRpc(spec);
            expect(result.type).toBe("openrpc");
            expect(result.absoluteFilepath).toBe("/test/path/openrpc.json");
            expect(result.absoluteFilepathToOverrides).toBeUndefined();
            expect(result.namespace).toBeUndefined();
        });

        it("converts OpenRPC spec with overrides", () => {
            const spec: OpenRpcSpec = {
                openrpc: AbsoluteFilePath.of("/test/path/openrpc.json"),
                overrides: AbsoluteFilePath.of("/test/path/overrides.json")
            };

            const result = convertOpenRpc(spec);
            expect(result.type).toBe("openrpc");
            expect(result.absoluteFilepath).toBe("/test/path/openrpc.json");
            expect(result.absoluteFilepathToOverrides).toBe("/test/path/overrides.json");
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

    describe("settings completeness", () => {
        it("maps all BaseApiSettingsSchema fields for OpenAPI", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    // All base settings
                    respectNullableSchemas: true,
                    wrapReferencesToNullableInOptional: true,
                    coerceOptionalSchemasToNullable: true,
                    titleAsSchemaName: true,
                    coerceEnumsToLiterals: true,
                    optionalAdditionalProperties: true,
                    idiomaticRequestNames: true,
                    groupEnvironmentsByHost: true,
                    removeDiscriminantsFromSchemas: "always",
                    pathParameterOrder: "urlOrder"
                }
            };

            const result = convertOpenApi(spec);
            expect(result.settings).toBeDefined();
            // Verify each base setting is mapped
            expect(result.settings?.respectNullableSchemas).toBe(true);
            expect(result.settings?.wrapReferencesToNullableInOptional).toBe(true);
            expect(result.settings?.coerceOptionalSchemasToNullable).toBe(true);
            expect(result.settings?.useTitlesAsName).toBe(true);
            expect(result.settings?.coerceEnumsToLiterals).toBe(true);
            expect(result.settings?.optionalAdditionalProperties).toBe(true);
            expect(result.settings?.shouldUseIdiomaticRequestNames).toBe(true);
            expect(result.settings?.groupEnvironmentsByHost).toBe(true);
            expect(result.settings?.removeDiscriminantsFromSchemas).toBe(
                generatorsYml.RemoveDiscriminantsFromSchemas.Always
            );
            expect(result.settings?.pathParameterOrder).toBe(generatorsYml.PathParameterOrder.UrlOrder);
        });

        it("maps all OpenApiSettingsSchema-specific fields", () => {
            const spec: OpenApiSpec = {
                openapi: AbsoluteFilePath.of("/test/path/openapi.yml"),
                settings: {
                    // OpenAPI-specific settings
                    onlyIncludeReferencedSchemas: true,
                    inlinePathParameters: true,
                    preferUndiscriminatedUnionsWithLiterals: true,
                    objectQueryParameters: true,
                    respectReadonlySchemas: true,
                    respectForwardCompatibleEnums: true,
                    useBytesForBinaryResponse: true,
                    defaultFormParameterEncoding: "json",
                    filter: { endpoints: ["GET /users"] },
                    exampleGeneration: { request: { maxDepth: 5 } },
                    additionalPropertiesDefaultsTo: true,
                    typeDatesAsStrings: false,
                    preserveSingleSchemaOneof: true,
                    inlineAllOfSchemas: true,
                    resolveAliases: { except: ["MyAlias"] },
                    groupMultiApiEnvironments: true,
                    defaultIntegerFormat: "int64"
                }
            };

            const result = convertOpenApi(spec);
            expect(result.settings).toBeDefined();
            expect(result.settings?.onlyIncludeReferencedSchemas).toBe(true);
            expect(result.settings?.inlinePathParameters).toBe(true);
            expect(result.settings?.shouldUseUndiscriminatedUnionsWithLiterals).toBe(true);
            expect(result.settings?.objectQueryParameters).toBe(true);
            expect(result.settings?.respectReadonlySchemas).toBe(true);
            expect(result.settings?.respectForwardCompatibleEnums).toBe(true);
            expect(result.settings?.useBytesForBinaryResponse).toBe(true);
            expect(result.settings?.defaultFormParameterEncoding).toBe("json");
            expect(result.settings?.filter).toEqual({ endpoints: ["GET /users"] });
            expect(result.settings?.exampleGeneration).toEqual({ request: { "max-depth": 5 } });
            expect(result.settings?.additionalPropertiesDefaultsTo).toBe(true);
            expect(result.settings?.typeDatesAsStrings).toBe(false);
            expect(result.settings?.preserveSingleSchemaOneOf).toBe(true);
            expect(result.settings?.inlineAllOfSchemas).toBe(true);
            expect(result.settings?.resolveAliases).toEqual({ except: ["MyAlias"] });
            expect(result.settings?.groupMultiApiEnvironments).toBe(true);
            expect(result.settings?.defaultIntegerFormat).toBe(generatorsYml.DefaultIntegerFormat.Int64);
        });

        it("maps all BaseApiSettingsSchema fields for AsyncAPI", () => {
            const spec: AsyncApiSpec = {
                asyncapi: AbsoluteFilePath.of("/test/path/asyncapi.yml"),
                settings: {
                    // All base settings
                    respectNullableSchemas: true,
                    wrapReferencesToNullableInOptional: true,
                    coerceOptionalSchemasToNullable: true,
                    titleAsSchemaName: true,
                    coerceEnumsToLiterals: true,
                    optionalAdditionalProperties: true,
                    idiomaticRequestNames: true,
                    groupEnvironmentsByHost: true,
                    removeDiscriminantsFromSchemas: "never",
                    pathParameterOrder: "specOrder"
                }
            };

            const result = convertAsyncApi(spec);
            expect(result.settings).toBeDefined();
            expect(result.settings?.respectNullableSchemas).toBe(true);
            expect(result.settings?.wrapReferencesToNullableInOptional).toBe(true);
            expect(result.settings?.coerceOptionalSchemasToNullable).toBe(true);
            expect(result.settings?.useTitlesAsName).toBe(true);
            expect(result.settings?.coerceEnumsToLiterals).toBe(true);
            expect(result.settings?.optionalAdditionalProperties).toBe(true);
            expect(result.settings?.shouldUseIdiomaticRequestNames).toBe(true);
            expect(result.settings?.groupEnvironmentsByHost).toBe(true);
            expect(result.settings?.removeDiscriminantsFromSchemas).toBe(
                generatorsYml.RemoveDiscriminantsFromSchemas.Never
            );
            expect(result.settings?.pathParameterOrder).toBe(generatorsYml.PathParameterOrder.SpecOrder);
        });

        it("maps all AsyncApiSettingsSchema-specific fields", () => {
            const spec: AsyncApiSpec = {
                asyncapi: AbsoluteFilePath.of("/test/path/asyncapi.yml"),
                settings: {
                    messageNaming: "v2"
                }
            };

            const result = convertAsyncApi(spec);
            expect(result.settings?.asyncApiNaming).toBe("v2");
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

    function convertOpenRpc(spec: OpenRpcSpec): OpenRPCSpec {
        const result = adapter.adapt(spec);
        return result as OpenRPCSpec;
    }
});
