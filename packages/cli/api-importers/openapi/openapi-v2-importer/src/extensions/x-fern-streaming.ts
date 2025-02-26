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
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        if (typeof extensionValue === "boolean") {
            return extensionValue ? { type: "stream", format: "json" } : undefined;
        }

        if (typeof extensionValue !== "object") {
            errorCollector.collect({
                message: "Received unexpected non-object value for x-fern-streaming",
                path: this.breadcrumbs
            });
            return undefined;
        }

        const extensionObject = extensionValue as Raw.StreamingExtensionObjectSchema;
        if (extensionObject["stream-condition"] == null && extensionObject.format != null) {
            return { type: "stream", format: extensionObject.format };
        }
        return {
            type: "streamCondition",
            format: extensionObject.format ?? "json",
            streamDescription: extensionObject["stream-description"],
            streamConditionProperty: context.maybeTrimPrefix(extensionObject["stream-condition"], REQUEST_PREFIX),
            responseStream: extensionObject["response-stream"],
            response: extensionObject.response
        };
    }
}
