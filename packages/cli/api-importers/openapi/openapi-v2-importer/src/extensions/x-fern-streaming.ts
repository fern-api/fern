import { OpenAPIV3 } from "openapi-types";
import { z } from "zod";

import { AbstractConverter } from "../AbstractConverter";
import { AbstractExtension } from "../AbstractExtension";
import { ErrorCollector } from "../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../openapi_3_1/OpenAPIConverterContext3_1";

const REQUEST_PREFIX = "$request.";

const StreamingExtensionObjectSchema = z.object({
    "stream-condition": z.string().optional(),
    format: z.enum(["sse", "json"]).optional(),
    "stream-description": z.string().optional(),
    "response-stream": z.any(),
    response: z.any()
});

const StreamingExtensionSchema = z.union([z.boolean(), StreamingExtensionObjectSchema]);

type OnlyStreamingEndpoint = {
    type: "stream";
    format: "sse" | "json";
};

type StreamConditionEndpoint = {
    type: "streamCondition";
    format: "sse" | "json";
    streamDescription: string | undefined;
    streamConditionProperty: string;
    responseStream: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
};

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

        const result = StreamingExtensionSchema.safeParse(extensionValue);
        if (!result.success) {
            errorCollector.collect({
                message: `Invalid x-fern-streaming extension: ${result.error.message}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        if (typeof result.data === "boolean") {
            return result.data ? { type: "stream", format: "json" } : undefined;
        }

        if (result.data["stream-condition"] == null && result.data.format != null) {
            return { type: "stream", format: result.data.format };
        }

        if (result.data["stream-condition"] == null) {
            errorCollector.collect({
                message: "Missing required stream-condition property",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return {
            type: "streamCondition",
            format: result.data.format ?? "json",
            streamDescription: result.data["stream-description"],
            streamConditionProperty: context.maybeTrimPrefix(result.data["stream-condition"], REQUEST_PREFIX),
            responseStream: result.data["response-stream"],
            response: result.data.response
        };
    }
}
