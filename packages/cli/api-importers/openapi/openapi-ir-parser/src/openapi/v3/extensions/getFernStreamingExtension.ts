import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

const REQUEST_PREFIX = "$request.";

export type FernStreamingExtension = OnlyStreamingEndpoint | StreamConditionEndpoint;

export interface OnlyStreamingEndpoint {
    type: "stream";
    format: "sse" | "json";
}

export interface StreamConditionEndpoint {
    type: "streamCondition";
    format: "sse" | "json";
    streamDescription: string | undefined;
    streamConditionProperty: string;
    responseStream: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
}

declare namespace Raw {
    export type StreamingExtensionSchema = boolean | StreamingExtensionObjectSchema;

    export interface StreamingExtensionObjectSchema {
        ["stream-condition"]: string;
        ["format"]: "sse" | "json" | undefined;
        ["stream-description"]: string | undefined;
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
                  format: "json"
              }
            : undefined;
    }

    if (streaming["stream-condition"] == null && streaming.format != null) {
        return {
            type: "stream",
            format: streaming.format
        };
    }

    return {
        type: "streamCondition",
        format: streaming.format ?? "json", // Default to "json"
        streamDescription: streaming["stream-description"],
        streamConditionProperty: maybeTrimRequestPrefix(streaming["stream-condition"]),
        responseStream: streaming["response-stream"],
        response: streaming.response
    };
}

function maybeTrimRequestPrefix(streamCondition: string): string {
    if (streamCondition.startsWith(REQUEST_PREFIX)) {
        return streamCondition.slice(REQUEST_PREFIX.length);
    }
    return streamCondition;
}
