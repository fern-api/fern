import { assertNever } from "@fern-api/core-utils";
import { EndpointWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernStreamingExtension } from "../../extensions/getFernStreamingExtension";
import { OperationContext } from "../contexts";
import { convertHttpOperation } from "./convertHttpOperation";

export interface StreamingEndpoints {
    streaming: EndpointWithExample;
    nonStreaming: EndpointWithExample | undefined;
}

export function convertStreamingOperation({
    operationContext,
    context,
    streamingExtension,
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
    streamingExtension: FernStreamingExtension;
}): StreamingEndpoints | undefined {
    switch (streamingExtension.type) {
        case "stream": {
            const streamingOperation = convertHttpOperation({
                operationContext,
                context,
                streamingResponse: true,
            });
            return {
                streaming: streamingOperation,
                nonStreaming: undefined,
            };
        }
        case "streamCondition":
            break;
        default:
            assertNever(streamingExtension);
    }
    return undefined;
}
