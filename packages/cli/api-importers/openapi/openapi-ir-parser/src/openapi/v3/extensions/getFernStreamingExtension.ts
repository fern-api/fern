import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

const REQUEST_PREFIX = "$request.";

export type FernStreamingExtension = OnlyStreamingEndpoint | StreamConditionEndpoint;

export interface OnlyStreamingEndpoint {
    type: "stream";
    format: "sse" | "json";
    terminator: string | undefined;
}

export interface StreamConditionEndpoint {
    type: "streamCondition";
    format: "sse" | "json";
    terminator: string | undefined;
    streamDescription: string | undefined;
    streamConditionProperty: string;
    streamRequestName: string | undefined;
    responseStream: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
}

declare namespace Raw {
    export type StreamingExtensionSchema = boolean | StreamingExtensionObjectSchema;

    export interface StreamingExtensionObjectSchema {
        ["stream-condition"]: string;
        ["format"]: "sse" | "json" | undefined;
        ["stream-description"]: string | undefined;
        ["stream-request-name"]: string | undefined;
        ["response-stream"]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
        response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
        terminator: string | undefined;
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
                  format: "json",
                  terminator: undefined
              }
            : undefined;
    }

    if (streaming["stream-condition"] == null && streaming.format != null) {
        return {
            type: "stream",
            format: streaming.format,
            terminator: streaming.terminator
        };
    }

    return {
        type: "streamCondition",
        format: streaming.format ?? "json", // Default to "json"
        terminator: streaming.terminator,
        streamDescription: streaming["stream-description"],
        streamConditionProperty: maybeTrimRequestPrefix(streaming["stream-condition"]),
        streamRequestName: streaming["stream-request-name"],
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
