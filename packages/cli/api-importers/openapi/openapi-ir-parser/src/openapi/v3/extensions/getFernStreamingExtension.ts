import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

const REQUEST_PREFIX = "$request.";

export type FernStreamingExtension = OnlyStreamingEndpoint | StreamConditionEndpoint;

export interface OnlyStreamingEndpoint {
    type: "stream";
    format: "sse" | "json";
    terminator: string | undefined;
    resumable: boolean;
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
    resumable: boolean;
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
        resumable: boolean | undefined;
    }
}

export function getFernStreamingExtension(
    document: OpenAPIV3.Document,
    operation: OpenAPIV3.OperationObject
): FernStreamingExtension | undefined {
    const streaming = getExtension<Raw.StreamingExtensionSchema>(operation, FernOpenAPIExtension.STREAMING);

    if (streaming == null) {
        return undefined;
    }

    if (typeof streaming === "boolean") {
        // Boolean shorthand emits format: "json", which has no Last-Event-ID semantics —
        // do not inherit resumable from the document for this case.
        return streaming
            ? {
                  type: "stream",
                  format: "json",
                  terminator: undefined,
                  resumable: false
              }
            : undefined;
    }

    const resumable = resolveResumable(document, streaming);

    if (streaming["stream-condition"] == null && streaming.format != null) {
        return {
            type: "stream",
            format: streaming.format,
            terminator: streaming.terminator,
            resumable
        };
    }

    return {
        type: "streamCondition",
        format: streaming.format ?? "json",
        terminator: streaming.terminator,
        streamDescription: streaming["stream-description"],
        streamConditionProperty: maybeTrimRequestPrefix(streaming["stream-condition"]),
        streamRequestName: streaming["stream-request-name"],
        responseStream: streaming["response-stream"],
        response: streaming.response,
        resumable
    };
}

function resolveResumable(document: OpenAPIV3.Document, streaming: Raw.StreamingExtensionObjectSchema): boolean {
    if (typeof streaming.resumable === "boolean") {
        return streaming.resumable;
    }
    return getDocumentLevelResumable(document) ?? false;
}

export function getDocumentLevelResumable(document: OpenAPIV3.Document): boolean | undefined {
    const docStreaming = getExtension<Raw.StreamingExtensionSchema>(document, FernOpenAPIExtension.STREAMING);
    if (docStreaming == null || typeof docStreaming === "boolean") {
        return undefined;
    }
    return typeof docStreaming.resumable === "boolean" ? docStreaming.resumable : undefined;
}

function maybeTrimRequestPrefix(streamCondition: string): string {
    if (streamCondition.startsWith(REQUEST_PREFIX)) {
        return streamCondition.slice(REQUEST_PREFIX.length);
    }
    return streamCondition;
}
