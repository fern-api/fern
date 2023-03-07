import { RawSchemas } from "@fern-api/yaml-schema";
import { HttpResponse, StreamingCondition } from "@fern-fern/ir-model/http";
import { FernFileContext } from "../../FernFileContext";

export function convertHttpResponse({
    endpoint,
    file,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
}): HttpResponse | undefined {
    const { response, ["response-stream"]: responseStream, ["stream-condition"]: rawStreamCondition } = endpoint;

    if (responseStream == null) {
        if (response == null) {
            return undefined;
        }
        return constructNonStreamingResponse(response, file);
    }

    const streamingResponse = HttpResponse.streaming({
        dataEventType: file.parseTypeReference(responseStream.data),
        terminator: responseStream.terminator,
    });

    if (response == null) {
        return streamingResponse;
    }

    if (rawStreamCondition == null) {
        throw new Error("Both response and response-stream are specified, but stream-condition is absent.");
    }

    const streamCondition = constructStreamCondition(rawStreamCondition);
    if (streamCondition == null) {
        throw new Error("Failed to parse stream condition");
    }

    return HttpResponse.maybeStreaming({
        nonStreaming: constructNonStreamingResponse(response, file),
        streaming: streamingResponse,
        condition: streamCondition,
    });
}

function constructNonStreamingResponse(
    response: RawSchemas.HttpResponseSchema,
    file: FernFileContext
): HttpResponse.NonStreaming {
    return HttpResponse.nonStreaming({
        docs: typeof response !== "string" ? response?.docs : undefined,
        responseBodyType: file.parseTypeReference(response),
    });
}

const STREAM_CONDITION_REGEX = /\$request.(.*)/;
export function constructStreamCondition(rawStreamCondition: string): StreamingCondition | undefined {
    const requestPropertyKey = rawStreamCondition.match(STREAM_CONDITION_REGEX)?.[1];
    if (requestPropertyKey == null) {
        return undefined;
    }
    return {
        requestPropertyKey,
    };
}
