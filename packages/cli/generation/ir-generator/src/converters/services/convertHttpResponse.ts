import { assertNever } from "@fern-api/core-utils";
import {
    HttpResponse,
    HttpResponseBody,
    JsonResponse,
    NonStreamHttpResponseBody,
    StreamingResponse
} from "@fern-api/ir-sdk";
import { isRawTextType, parseRawFileType, parseRawTextType, RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getObjectPropertyFromResolvedType } from "./getObjectPropertyFromResolvedType";

export async function convertHttpResponse({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Promise<HttpResponse | undefined> {
    const responseBody = await convertHttpResponseBody({
        endpoint,
        file,
        typeResolver
    });
    return {
        body: responseBody,
        statusCode: typeof endpoint.response !== "string" ? endpoint.response?.["status-code"] : undefined
    };
}

export async function convertHttpResponseBody({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Promise<HttpResponseBody | undefined> {
    const response = await convertNonStreamHttpResponseBody({
        endpoint,
        file,
        typeResolver
    });

    const streamResponse = await convertStreamHttpResponseBody({
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

export async function convertNonStreamHttpResponseBody({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Promise<HttpResponseBody.FileDownload | HttpResponseBody.Text | HttpResponseBody.Json | undefined> {
    const { response } = endpoint;

    if (response != null) {
        const docs = typeof response !== "string" ? response.docs : undefined;
        const responseType = typeof response === "string" ? response : response.type;

        if (parseRawFileType(responseType) != null) {
            return HttpResponseBody.fileDownload({
                docs
            });
        } else if (parseRawTextType(responseType) != null) {
            return HttpResponseBody.text({
                docs
            });
        } else {
            return await convertJsonResponse(response, docs, file, typeResolver);
        }
    }

    return undefined;
}

export async function convertStreamHttpResponseBody({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): Promise<StreamingResponse | undefined> {
    const { ["response-stream"]: responseStream } = endpoint;

    if (responseStream != null) {
        const docs = typeof responseStream !== "string" ? responseStream.docs : undefined;
        const typeReference = typeof responseStream === "string" ? responseStream : responseStream.type;
        const streamFormat = typeof responseStream === "string" ? "json" : responseStream.format ?? "json";
        if (isRawTextType(typeReference)) {
            return StreamingResponse.text({
                docs
            });
        } else if (typeof responseStream !== "string" && streamFormat === "sse") {
            return StreamingResponse.sse({
                docs,
                payload: file.parseTypeReference(typeReference),
                terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined
            });
        } else {
            return StreamingResponse.json({
                docs,
                payload: file.parseTypeReference(typeReference),
                terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined
            });
        }
    }

    return undefined;
}

async function convertJsonResponse(
    response: RawSchemas.HttpResponseSchema | string,
    docs: string | undefined,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<HttpResponseBody.Json> {
    const responseBodyType = file.parseTypeReference(response);
    const resolvedType = typeResolver.resolveTypeOrThrow({
        type: typeof response !== "string" ? response.type : response,
        file
    });
    const responseProperty = typeof response !== "string" ? response.property : undefined;
    if (responseProperty != null) {
        return HttpResponseBody.json(
            JsonResponse.nestedPropertyAsResponse({
                docs,
                responseBodyType,
                responseProperty: await getObjectPropertyFromResolvedType({
                    typeResolver,
                    file,
                    resolvedType,
                    property: responseProperty
                })
            })
        );
    }
    return HttpResponseBody.json(
        JsonResponse.response({
            docs,
            responseBodyType
        })
    );
}
