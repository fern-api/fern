import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import { SdkRequest, SdkRequestShape } from "@fern-fern/ir-sdk/api";
import { size } from "lodash-es";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { convertReferenceHttpRequestBody } from "./convertHttpRequestBody";

export const DEFAULT_REQUEST_PARAMETER_NAME = "request";
export const DEFAULT_BODY_PROPERTY_KEY_IN_WRAPPER = "body";

export function convertHttpSdkRequest({
    request,
    service,
    file,
    typeResolver,
}: {
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    service: RawSchemas.HttpServiceSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): SdkRequest | undefined {
    const shape = convertHttpSdkRequestShape({ request, service, file, typeResolver });
    if (shape == null) {
        return undefined;
    }
    return {
        shape,
        requestParameterName: file.casingsGenerator.generateName(DEFAULT_REQUEST_PARAMETER_NAME),
    };
}

function convertHttpSdkRequestShape({
    service,
    request,
    file,
    typeResolver,
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
        });
    };

    if (!areAllHeadersLiteral({ headers: service.headers ?? {}, file, typeResolver })) {
        return constructWrapper();
    }

    if (request == null) {
        return undefined;
    }

    if (typeof request === "string") {
        return SdkRequestShape.justRequestBody(convertReferenceHttpRequestBody({ requestBody: request, file }));
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

    return SdkRequestShape.justRequestBody(convertReferenceHttpRequestBody({ requestBody: body, file }));
}

export function doesRequestHaveNonBodyProperties({
    request,
    file,
    typeResolver,
}: {
    request: RawSchemas.HttpRequestSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): boolean {
    const { headers = {}, "query-parameters": queryParameters = {} } = request;

    return !areAllHeadersLiteral({ headers, file, typeResolver }) || size(queryParameters) > 0;
}

function areAllHeadersLiteral({
    headers,
    file,
    typeResolver,
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
                file,
            });
            const isLiteral = resolvedType._type === "container" && resolvedType.container._type === "literal";
            return !isLiteral;
        }).length === 0
    );
}
