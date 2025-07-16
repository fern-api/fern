import { RawSchemas } from '@fern-api/fern-definition-schema'

export interface ConvertOpenAPIOptions {
    /**
     * If true, each error will be made unique per endpoint. This is the preferred behavior for Docs.
     * If false, error codes will be shared across endpoints. The side effect is that if more than one error schema is detected for each error code, then the error schema will default to unknown. This is the preferred behavior for SDKs.
     */
    enableUniqueErrorsPerEndpoint: boolean

    /**
     * If true, the converter will detect frequently headers and add extract them as global headers within
     * the IR. This is primarily used for generating SDKs, but disabled for docs as it allows the documentation
     */
    detectGlobalHeaders: boolean

    /**
     * If true, the converter will generate complex query parameters in the generated Fern Definition.
     */
    objectQueryParameters: boolean

    /**
     * If true, the converter will respect readonly properties in OpenAPI schemas.
     */
    respectReadonlySchemas: boolean

    /**
     * If true, the converter will respect nullable properties in OpenAPI schemas.
     */
    respectNullableSchemas: boolean

    /**
     * If true, the converter will only include schemas referenced by endpoints.
     */
    onlyIncludeReferencedSchemas: boolean

    /**
     * If true, the converter will include path parameters in the in-lined request.
     */
    inlinePathParameters: boolean

    /**
     * If true, the converter will use the `bytes` type for binary responses.
     */
    useBytesForBinaryResponse: boolean

    /**
     * If true, the converter will respect forward compatible enums during generation.
     */
    respectForwardCompatibleEnums: boolean

    /**
     * Overrides the auth schema that would be detected from the OpenAPI spec.
     */
    auth?: RawSchemas.ApiAuthSchema
}

export const DEFAULT_CONVERT_OPENAPI_OPTIONS: ConvertOpenAPIOptions = {
    enableUniqueErrorsPerEndpoint: false,
    detectGlobalHeaders: true,
    objectQueryParameters: false,
    respectReadonlySchemas: false,
    respectNullableSchemas: false,
    onlyIncludeReferencedSchemas: false,
    inlinePathParameters: false,
    useBytesForBinaryResponse: false,
    respectForwardCompatibleEnums: false
}

export function getConvertOptions({
    options,
    overrides
}: {
    options?: Partial<ConvertOpenAPIOptions>
    overrides?: Partial<ConvertOpenAPIOptions>
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
            DEFAULT_CONVERT_OPENAPI_OPTIONS.respectForwardCompatibleEnums
    }
}
