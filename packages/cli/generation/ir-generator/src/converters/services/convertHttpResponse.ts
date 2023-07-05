import { isRawTextType, parseRawFileType, RawSchemas } from "@fern-api/yaml-schema";
import {
    HttpEndpoint,
    HttpResponse,
    SdkResponse,
    StreamCondition,
    StreamingResponse,
    StreamingResponseChunkType,
} from "@fern-fern/ir-model/http";
import { FernFileContext } from "../../FernFileContext";

export function convertHttpResponse({
    endpoint,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
}): Pick<HttpEndpoint, "response" | "streamingResponse" | "sdkResponse"> {
    const { response, ["response-stream"]: responseStream, ["stream-condition"]: rawStreamCondition } = endpoint;

    const httpResponse = response != null ? constructHttpResponse(response, file) : undefined;
    const streamingResponse: StreamingResponse | undefined =
        responseStream != null
            ? {
                  dataEventType: constructStreamingResponseChunkType(responseStream, file),
                  terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined,
              }
            : undefined;

    const constructSdkResponse = () => {
        if (streamingResponse == null) {
            if (httpResponse == null) {
                return undefined;
            }
            return HttpResponse._visit<SdkResponse>(httpResponse, {
                json: SdkResponse.json,
                fileDownload: SdkResponse.fileDownload,
                _unknown: () => {
                    throw new Error("Unknown HttpResponse: " + httpResponse.type);
                },
            });
        }

        if (httpResponse == null) {
            return SdkResponse.streaming(streamingResponse);
        }

        if (rawStreamCondition == null) {
            throw new Error("Both response and response-stream are specified, but stream-condition is absent.");
        }

        const streamCondition = constructStreamCondition(rawStreamCondition);
        if (streamCondition == null) {
            throw new Error("Failed to parse stream condition");
        }

        return SdkResponse.maybeStreaming({
            streaming: streamingResponse,
            nonStreaming: httpResponse,
            condition: streamCondition,
        });
    };

    return {
        response: httpResponse,
        streamingResponse,
        sdkResponse: constructSdkResponse(),
    };
}

function constructStreamingResponseChunkType(
    responseStream: RawSchemas.HttpResponseStreamSchema | string,
    file: FernFileContext
): StreamingResponseChunkType {
    const typeReference = typeof responseStream === "string" ? responseStream : responseStream.type;
    if (isRawTextType(typeReference)) {
        return StreamingResponseChunkType.text();
    } else {
        return StreamingResponseChunkType.json(file.parseTypeReference(typeReference));
    }
}

function constructHttpResponse(response: RawSchemas.HttpResponseSchema, file: FernFileContext): HttpResponse {
    const docs = typeof response !== "string" ? response.docs : undefined;
    const responseType = typeof response === "string" ? response : response.type;

    if (parseRawFileType(responseType) != null) {
        return HttpResponse.fileDownload({
            docs,
        });
    } else {
        return HttpResponse.json({
            docs,
            responseBodyType: file.parseTypeReference(response),
        });
    }
}

const REQUEST_PROPERTY_STREAM_CONDITION_REGEX = /\$request.(.*)/;
const QUERY_PARAMETER_STREAM_CONDITION_REGEX = /\$query.(.*)/;
export function constructStreamCondition(rawStreamCondition: string): StreamCondition | undefined {
    const requestPropertyKey = rawStreamCondition.match(REQUEST_PROPERTY_STREAM_CONDITION_REGEX)?.[1];
    if (requestPropertyKey != null) {
        return StreamCondition.requestPropertyKey(requestPropertyKey);
    }

    const queryParameterKey = rawStreamCondition.match(QUERY_PARAMETER_STREAM_CONDITION_REGEX)?.[1];
    if (queryParameterKey != null) {
        return StreamCondition.queryParameterKey(queryParameterKey);
    }

    return undefined;
}
