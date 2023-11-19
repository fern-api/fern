import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

const REQUEST_PREFIX = "$request.";

export type FernStreamingExtension = OnlyStreamingEndpoint | StreamConditionEndpoint;

export interface OnlyStreamingEndpoint {
    type: "stream";
}

export interface StreamConditionEndpoint {
    type: "streamCondition";
    streamConditionProperty: string;
    responseStream: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
}

declare namespace Raw {
    export type StreamingExtensionSchema = boolean | StreamingExtensionObjectSchema;

    export interface StreamingExtensionObjectSchema {
        ["stream-condition"]: string;
        ["response-stream"]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
        response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    }
}

export function getFernStreamingExtension(operation: OpenAPIV3.OperationObject): FernStreamingExtension | undefined {
    const streaming = getExtension<Raw.StreamingExtensionSchema>(operation, FernOpenAPIExtension.STREAMING);

    if (streaming == null) {
        return undefined;
    }

    if (typeof streaming === "boolean") {
        return streaming
            ? {
                  type: "stream",
              }
            : undefined;
    }

    return {
        type: "streamCondition",
        streamConditionProperty: maybeTrimRequestPrefix(streaming["stream-condition"]),
        responseStream: streaming["response-stream"],
        response: streaming.response,
    };
}

function maybeTrimRequestPrefix(streamCondition: string): string {
    if (streamCondition.startsWith(REQUEST_PREFIX)) {
        return streamCondition.slice(REQUEST_PREFIX.length);
    }
    return streamCondition;
}
