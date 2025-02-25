import { OpenAPIV3 } from "openapi-types";

import { OpenAPIConverterContext3_1 } from "../3.1/OpenAPIConverterContext3_1";
import { AbstractConverter } from "../AbstractConverter";
import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";

const REQUEST_PREFIX = "$request.";

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

export declare namespace FernStreamingExtension {
    export interface Args extends AbstractConverter.Args {
        operation: object;
    }

    export type Output = OnlyStreamingEndpoint | StreamConditionEndpoint;
}

export class FernStreamingExtension extends AbstractExtension<
    OpenAPIConverterContext3_1,
    FernStreamingExtension.Output
> {
    private readonly operation: object;
    public readonly key = "x-fern-streaming";

    constructor({ breadcrumbs, operation }: FernStreamingExtension.Args) {
        super({ breadcrumbs });
        this.operation = operation;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): FernStreamingExtension.Output | undefined {
        const extensionValue = this.getExtensionValue<Raw.StreamingExtensionSchema>(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue === "boolean") {
            return extensionValue
                ? {
                      type: "stream",
                      format: "json"
                  }
                : undefined;
        }

        if (extensionValue["stream-condition"] == null && extensionValue.format != null) {
            return {
                type: "stream",
                format: extensionValue.format
            };
        }

        return {
            type: "streamCondition",
            format: extensionValue.format ?? "json", // Default to "json"
            streamDescription: extensionValue["stream-description"],
            streamConditionProperty: this.maybeTrimRequestPrefix(extensionValue["stream-condition"]),
            responseStream: extensionValue["response-stream"],
            response: extensionValue.response
        };
    }

    private maybeTrimRequestPrefix(streamCondition: string): string {
        if (streamCondition.startsWith(REQUEST_PREFIX)) {
            return streamCondition.slice(REQUEST_PREFIX.length);
        }
        return streamCondition;
    }
}
