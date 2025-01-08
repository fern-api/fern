import { size } from "lodash-es";

import { RawSchemas, isInlineRequestBody, parseRawBytesType } from "@fern-api/fern-definition-schema";
import { SdkRequest, SdkRequestBodyType, SdkRequestShape } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { PropertyResolver } from "../../resolvers/PropertyResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { convertReferenceHttpRequestBody } from "./convertHttpRequestBody";
import { getRequestPropertyComponents } from "./convertProperty";

export const DEFAULT_REQUEST_PARAMETER_NAME = "request";
export const DEFAULT_BODY_PROPERTY_KEY_IN_WRAPPER = "body";

export function convertHttpSdkRequest({
    request,
    endpointKey,
    endpoint,
    service,
    file,
    typeResolver,
    propertyResolver
}: {
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    endpointKey: string;
    endpoint: RawSchemas.HttpEndpointSchema;
    service: RawSchemas.HttpServiceSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    propertyResolver: PropertyResolver;
}): SdkRequest | undefined {
    const shape = convertHttpSdkRequestShape({ request, service, file, typeResolver });
    if (shape == null) {
        return undefined;
    }
    return {
        shape,
        requestParameterName: file.casingsGenerator.generateName(DEFAULT_REQUEST_PARAMETER_NAME),
        streamParameter:
            endpoint["stream-condition"] != null
                ? propertyResolver.resolveRequestPropertyOrThrow({
                      file,
                      endpoint: endpointKey,
                      propertyComponents: getRequestPropertyComponents(endpoint["stream-condition"])
                  })
                : undefined
    };
}

function convertHttpSdkRequestShape({
    service,
    request,
    file,
    typeResolver
}: {
    service: RawSchemas.HttpServiceSchema;
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): SdkRequestShape | undefined {
    const constructWrapper = () => {
        if (typeof request === "string" || request?.name == null) {
            throw new Error("Name is missing for request wrapper");
        }
        return SdkRequestShape.wrapper({
            wrapperName: file.casingsGenerator.generateName(request.name),
            bodyKey: file.casingsGenerator.generateName(DEFAULT_BODY_PROPERTY_KEY_IN_WRAPPER),
            includePathParameters: shouldIncludePathParametersInWrapper(request),
            onlyPathParameters: doesRequestHaveOnlyPathParameters({ request, file, typeResolver })
        });
    };

    if (!areAllHeadersLiteral({ headers: service.headers ?? {}, file, typeResolver })) {
        return constructWrapper();
    }

    if (request == null) {
        return undefined;
    }

    if (typeof request === "string") {
        return SdkRequestShape.justRequestBody(getSdkJustRequestBodyType({ requestBody: request, file }));
    }

    const { body } = request;
    if (
        doesRequestHaveNonBodyProperties({ request, file, typeResolver }) ||
        (body != null && isInlineRequestBody(body))
    ) {
        return constructWrapper();
    }

    if (body == null) {
        return undefined;
    }

    return SdkRequestShape.justRequestBody(getSdkJustRequestBodyType({ requestBody: body, file }));
}

export function getSdkJustRequestBodyType({
    requestBody,
    file,
    contentType
}: {
    requestBody: RawSchemas.HttpReferencedRequestBodySchema | string;
    file: FernFileContext;
    contentType?: string;
}): SdkRequestBodyType {
    const rawBytes =
        typeof requestBody === "string" ? parseRawBytesType(requestBody) : parseRawBytesType(requestBody.type);
    if (rawBytes != null) {
        return SdkRequestBodyType.bytes({
            isOptional: rawBytes.isOptional,
            contentType,
            docs: undefined
        });
    }
    return SdkRequestBodyType.typeReference(
        convertReferenceHttpRequestBody({
            requestBody,
            file,
            contentType
        })
    );
}

export function doesRequestHaveNonBodyProperties({
    request,
    file,
    typeResolver
}: {
    request: RawSchemas.HttpRequestSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): boolean {
    const { headers = {}, "path-parameters": pathParameters = {}, "query-parameters": queryParameters = {} } = request;

    return (
        !areAllHeadersLiteral({ headers, file, typeResolver }) || size(pathParameters) > 0 || size(queryParameters) > 0
    );
}

function doesRequestHaveOnlyPathParameters({
    request,
    file,
    typeResolver
}: {
    request: RawSchemas.HttpRequestSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): boolean {
    const { headers = {}, "path-parameters": pathParameters = {}, "query-parameters": queryParameters = {} } = request;

    return (
        size(pathParameters) > 0 &&
        areAllHeadersLiteral({ headers, file, typeResolver }) &&
        size(queryParameters) === 0 &&
        request.body == null
    );
}

function shouldIncludePathParametersInWrapper(request: RawSchemas.HttpRequestSchema): boolean {
    return typeof request !== "string" && request?.["path-parameters"] != null;
}

function areAllHeadersLiteral({
    headers,
    file,
    typeResolver
}: {
    headers: Record<string, string | RawSchemas.HttpHeaderSchema>;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): boolean {
    return (
        Object.values(headers).filter((header) => {
            const headerType = typeof header === "string" ? header : header.type;
            const resolvedType = typeResolver.resolveTypeOrThrow({
                type: headerType,
                file
            });
            const isLiteral = resolvedType._type === "container" && resolvedType.container._type === "literal";
            return !isLiteral;
        }).length === 0
    );
}
