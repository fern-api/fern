import { assertNever } from "@fern-api/core-utils";
import {
    isRawTextType,
    parseRawBytesType,
    parseRawFileType,
    parseRawTextType,
    RawSchemas
} from "@fern-api/fern-definition-schema";
import {
    HttpResponse,
    HttpResponseBody,
    JsonResponse,
    NonStreamHttpResponseBody,
    StreamingResponse
} from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getObjectPropertyFromResolvedType } from "./getObjectPropertyFromResolvedType";

export function convertHttpResponse({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): HttpResponse | undefined {
    const responseBody = convertHttpResponseBody({
        endpoint,
        file,
        typeResolver
    });
    return {
        body: responseBody,
        statusCode: typeof endpoint.response !== "string" ? endpoint.response?.["status-code"] : undefined
    };
}

export function convertHttpResponseBody({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): HttpResponseBody | undefined {
    const response = convertNonStreamHttpResponseBody({
        endpoint,
        file,
        typeResolver
    });

    const streamResponse = convertStreamHttpResponseBody({
        endpoint,
        file,
        typeResolver
    });

    if (response != null && streamResponse != null) {
        let nonStreamResponse: NonStreamHttpResponseBody;
        switch (response.type) {
            case "fileDownload": {
                nonStreamResponse = NonStreamHttpResponseBody.fileDownload({ ...response });
                break;
            }
            case "json": {
                nonStreamResponse = NonStreamHttpResponseBody.json({
                    ...response.value
                });
                break;
            }
            case "text": {
                nonStreamResponse = NonStreamHttpResponseBody.text({ ...response });
                break;
            }
            case "bytes": {
                nonStreamResponse = NonStreamHttpResponseBody.bytes({ ...response });
                break;
            }
            default:
                assertNever(response);
        }
        return HttpResponseBody.streamParameter({
            nonStreamResponse,
            streamResponse
        });
    } else if (response != null) {
        return response;
    } else if (streamResponse != null) {
        return HttpResponseBody.streaming(streamResponse);
    }

    return undefined;
}

export function convertNonStreamHttpResponseBody({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): HttpResponseBody.FileDownload | HttpResponseBody.Text | HttpResponseBody.Json | HttpResponseBody.Bytes | undefined {
    const { response } = endpoint;

    if (response != null) {
        const docs = typeof response !== "string" ? response.docs : undefined;
        const responseType = typeof response === "string" ? response : response.type;

        if (responseType != null) {
            if (parseRawFileType(responseType) != null) {
                return HttpResponseBody.fileDownload({
                    docs,
                    v2Examples: undefined
                });
            } else if (parseRawTextType(responseType) != null) {
                return HttpResponseBody.text({
                    docs,
                    v2Examples: undefined
                });
            } else if (parseRawBytesType(responseType) != null) {
                return HttpResponseBody.bytes({
                    docs,
                    v2Examples: undefined
                });
            } else {
                return convertJsonResponse(response, docs, file, typeResolver);
            }
        }
    }

    return undefined;
}

export function convertStreamHttpResponseBody({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): StreamingResponse | undefined {
    const { ["response-stream"]: responseStream } = endpoint;

    if (responseStream != null) {
        const docs = typeof responseStream !== "string" ? responseStream.docs : undefined;
        const typeReference = typeof responseStream === "string" ? responseStream : responseStream.type;
        const streamFormat = typeof responseStream === "string" ? "json" : (responseStream.format ?? "json");
        if (isRawTextType(typeReference)) {
            return StreamingResponse.text({
                docs,
                v2Examples: undefined
            });
        } else if (typeof responseStream !== "string" && streamFormat === "sse") {
            return StreamingResponse.sse({
                docs,
                payload: file.parseTypeReference(typeReference),
                terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined,
                v2Examples: undefined
            });
        } else {
            return StreamingResponse.json({
                docs,
                payload: file.parseTypeReference(typeReference),
                terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined,
                v2Examples: undefined
            });
        }
    }

    return undefined;
}

function convertJsonResponse(
    response: RawSchemas.HttpResponseSchema | string,
    docs: string | undefined,
    file: FernFileContext,
    typeResolver: TypeResolver
): HttpResponseBody.Json | undefined {
    const responseTypeReference = typeof response !== "string" ? response.type : response;
    if (responseTypeReference == null) {
        return undefined;
    }
    const responseBodyType = file.parseTypeReference(
        typeof response === "string" ? response : { ...response, type: responseTypeReference }
    );
    const resolvedType = typeResolver.resolveTypeOrThrow({
        type: responseTypeReference,
        file
    });
    const responseProperty = typeof response !== "string" ? response.property : undefined;
    if (responseProperty != null) {
        return HttpResponseBody.json(
            JsonResponse.nestedPropertyAsResponse({
                docs,
                responseBodyType,
                responseProperty: getObjectPropertyFromResolvedType({
                    typeResolver,
                    file,
                    resolvedType,
                    property: responseProperty
                }),
                v2Examples: undefined
            })
        );
    }
    return HttpResponseBody.json(
        JsonResponse.response({
            docs,
            responseBodyType,
            v2Examples: undefined
        })
    );
}
