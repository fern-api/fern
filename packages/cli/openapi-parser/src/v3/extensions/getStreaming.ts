import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export type Streaming = StreamingEndpoint | StreamingConditionEndpoint | undefined;

export interface StreamingEndpoint {
    type: "stream";
}

export interface StreamingConditionEndpoint {
    type: "streamCondition";
    streamConditionProperty: string;
    responseStream: string;
    response: string;
}

export interface StreamConfig {
    ["stream-condition"]: string;
    ["response-stream"]: string;
    response: string;
}

export function getStreaming(operation: OpenAPIV3.OperationObject): Streaming {
    const streaming = getExtension<boolean | StreamConfig>(operation, FernOpenAPIExtension.STREAMING);

    if (streaming == null) {
        return undefined;
    }

    if (typeof streaming === "boolean") {
        return {
            type: "stream",
        };
    }

    return {
        type: "streamCondition",
        streamConditionProperty: streaming["stream-condition"],
        responseStream: streaming["response-stream"],
        response: streaming.response,
    };
}
