import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpEndpoint, NonStreamingResponse, SdkResponse, StreamCondition } from "@fern-fern/ir-model/http";
import { FernFileContext } from "../../FernFileContext";

export function convertHttpResponse({
    endpoint,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
}): Pick<HttpEndpoint, "response" | "streamingResponse" | "sdkResponse"> {
    const { response, ["response-stream"]: responseStream, ["stream-condition"]: rawStreamCondition } = endpoint;

    const nonStreamingResponse = response != null ? constructNonStreamingResponse(response, file) : undefined;
    const streamingResponse =
        responseStream != null
            ? {
                  dataEventType: file.parseTypeReference(responseStream.data),
                  terminator: responseStream.terminator,
              }
            : undefined;

    const constructSdkResponse = () => {
        if (streamingResponse == null) {
            if (nonStreamingResponse == null) {
                return undefined;
            }
            return SdkResponse.nonStreaming(nonStreamingResponse);
        }

        if (nonStreamingResponse == null) {
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
            nonStreaming: nonStreamingResponse,
            condition: streamCondition,
        });
    };

    return {
        response: nonStreamingResponse,
        streamingResponse,
        sdkResponse: constructSdkResponse(),
    };
}

function constructNonStreamingResponse(
    response: RawSchemas.HttpResponseSchema,
    file: FernFileContext
): NonStreamingResponse {
    return {
        docs: typeof response !== "string" ? response.docs : undefined,
        responseBodyType: file.parseTypeReference(response),
    };
}

const STREAM_CONDITION_REGEX = /\$request.(.*)/;
export function constructStreamCondition(rawStreamCondition: string): StreamCondition | undefined {
    const requestPropertyKey = rawStreamCondition.match(STREAM_CONDITION_REGEX)?.[1];
    if (requestPropertyKey == null) {
        return undefined;
    }
    return {
        requestPropertyKey,
    };
}
