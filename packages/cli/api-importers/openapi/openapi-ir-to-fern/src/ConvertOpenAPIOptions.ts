import { generatorsYml } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";

export interface ConvertOpenAPIOptions {
    /**
     * If true, each error will be made unique per endpoint. This is the preferred behavior for Docs.
     * If false, error codes will be shared across endpoints. The side effect is that if more than one error schema is detected for each error code, then the error schema will default to unknown. This is the preferred behavior for SDKs.
     */
    enableUniqueErrorsPerEndpoint: boolean;

    /**
     * If true, the converter will detect frequently headers and add extract them as global headers within
     * the IR. This is primarily used for generating SDKs, but disabled for docs as it allows the documentation
     */
    detectGlobalHeaders: boolean;

    /**
     * If true, the converter will generate complex query parameters in the generated Fern Definition.
     */
    objectQueryParameters: boolean;

    /**
     * If true, the converter will respect readonly properties in OpenAPI schemas.
     */
    respectReadonlySchemas: boolean;

    /**
     * If true, the converter will respect nullable properties in OpenAPI schemas.
     */
    respectNullableSchemas: boolean;

    /**
     * If true, the converter will only include schemas referenced by endpoints.
     */
    onlyIncludeReferencedSchemas: boolean;

    /**
     * If true, the converter will include path parameters in the in-lined request.
     */
    inlinePathParameters: boolean;

    /**
     * If true, the converter will use the `bytes` type for binary responses.
     */
    useBytesForBinaryResponse: boolean;

    /**
     * If true, the converter will respect forward compatible enums during generation.
     */
    respectForwardCompatibleEnums: boolean;

    /**
     * Overrides the auth schema that would be detected from the OpenAPI spec.
     */
    auth?: RawSchemas.ApiAuthSchema;

    /**
     * If true, the converter will convert nullable schemas to optional nullable.
     * If false, the converter will convert nullable schemas to required nullable.
     * Defaults to true.
     */
    wrapReferencesToNullableInOptional: boolean;

    /**
     * If true, the converter will coerce nullable schemas to optional.
     * If false, the converter will keep nullable schemas as nullable.
     * Defaults to true.
     */
    coerceOptionalSchemasToNullable: boolean;

    /**
     * If true, group servers by host into unified environments regardless of protocol.
     * This allows APIs with multiple protocols (REST, WebSocket, etc.) to share environment configuration.
     * When enabled, environment URL IDs are generated with collision resolution:
     * - Use server name alone if no collision
     * - Add path segment if collision (e.g., "prod: https://api.com/foo" -> "foo")
     * - Add protocol if still collision (e.g., "prod: wss://api.com/foo" -> "foo_wss", only for non-HTTPS protocols)
     * Defaults to false to preserve existing behavior.
     */
    groupEnvironmentsByHost: boolean;

    /**
     * If `always`, remove discriminant properties from schemas in the IR, unless the schema is also used outside of a discriminated union.
     * If `never`, discriminant properties are preserved in the schemas.
     *
     * Defaults to `always`.
     */
    removeDiscriminantsFromSchemas: generatorsYml.RemoveDiscriminantsFromSchemas;
}

export const DEFAULT_CONVERT_OPENAPI_OPTIONS: ConvertOpenAPIOptions = {
    enableUniqueErrorsPerEndpoint: false,
    detectGlobalHeaders: true,
    objectQueryParameters: true,
    respectReadonlySchemas: false,
    respectNullableSchemas: true,
    onlyIncludeReferencedSchemas: false,
    inlinePathParameters: true,
    useBytesForBinaryResponse: false,
    respectForwardCompatibleEnums: false,
    wrapReferencesToNullableInOptional: false,
    coerceOptionalSchemasToNullable: false,
    groupEnvironmentsByHost: false,
    removeDiscriminantsFromSchemas: generatorsYml.RemoveDiscriminantsFromSchemas.Always
};

export function getConvertOptions({
    options,
    overrides
}: {
    options?: Partial<ConvertOpenAPIOptions>;
    overrides?: Partial<ConvertOpenAPIOptions>;
}): ConvertOpenAPIOptions {
    return {
        enableUniqueErrorsPerEndpoint:
            overrides?.enableUniqueErrorsPerEndpoint ??
            options?.enableUniqueErrorsPerEndpoint ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.enableUniqueErrorsPerEndpoint,
        detectGlobalHeaders:
            overrides?.detectGlobalHeaders ??
            options?.detectGlobalHeaders ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.detectGlobalHeaders,
        objectQueryParameters:
            overrides?.objectQueryParameters ??
            options?.objectQueryParameters ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.objectQueryParameters,
        respectReadonlySchemas:
            overrides?.respectReadonlySchemas ??
            options?.respectReadonlySchemas ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.respectReadonlySchemas,
        respectNullableSchemas:
            overrides?.respectNullableSchemas ??
            options?.respectNullableSchemas ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.respectNullableSchemas,
        onlyIncludeReferencedSchemas:
            overrides?.onlyIncludeReferencedSchemas ??
            options?.onlyIncludeReferencedSchemas ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.onlyIncludeReferencedSchemas,
        inlinePathParameters:
            overrides?.inlinePathParameters ??
            options?.inlinePathParameters ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.inlinePathParameters,
        useBytesForBinaryResponse:
            overrides?.useBytesForBinaryResponse ??
            options?.useBytesForBinaryResponse ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.useBytesForBinaryResponse,
        respectForwardCompatibleEnums:
            overrides?.respectForwardCompatibleEnums ??
            options?.respectForwardCompatibleEnums ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.respectForwardCompatibleEnums,
        wrapReferencesToNullableInOptional:
            overrides?.wrapReferencesToNullableInOptional ??
            options?.wrapReferencesToNullableInOptional ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.wrapReferencesToNullableInOptional,
        coerceOptionalSchemasToNullable:
            overrides?.coerceOptionalSchemasToNullable ??
            options?.coerceOptionalSchemasToNullable ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.coerceOptionalSchemasToNullable,
        groupEnvironmentsByHost:
            overrides?.groupEnvironmentsByHost ??
            options?.groupEnvironmentsByHost ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.groupEnvironmentsByHost,
        removeDiscriminantsFromSchemas:
            overrides?.removeDiscriminantsFromSchemas ??
            options?.removeDiscriminantsFromSchemas ??
            DEFAULT_CONVERT_OPENAPI_OPTIONS.removeDiscriminantsFromSchemas
    };
}
