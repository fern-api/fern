import { AbstractConverterContext, AbstractExtension } from "@fern-api/v3-importer-commons";
import { OpenAPIV3 } from "openapi-types";
import { z } from "zod";

const REQUEST_PREFIX = "$request.";

const StreamingExtensionObjectSchema = z.object({
    "stream-condition": z.string().optional(),
    format: z.enum(["sse", "json"]).optional(),
    "stream-description": z.string().optional(),
    "stream-request-name": z.string().optional(),
    "response-stream": z.any(),
    response: z.any(),
    terminator: z.string().optional()
});

const StreamingExtensionSchema = z.union([z.boolean(), StreamingExtensionObjectSchema]);

type OnlyStreamingEndpoint = {
    type: "stream";
    format: "sse" | "json";
    terminator: string | undefined;
};

type StreamConditionEndpoint = {
    type: "streamCondition";
    format: "sse" | "json";
    terminator: string | undefined;
    streamDescription: string | undefined;
    streamConditionProperty: string;
    streamRequestName: string | undefined;
    responseStream: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
};

export declare namespace FernStreamingExtension {
    export interface Args extends AbstractExtension.Args {
        operation: object;
    }

    export type Output = OnlyStreamingEndpoint | StreamConditionEndpoint;
}

export class FernStreamingExtension extends AbstractExtension<FernStreamingExtension.Output> {
    private readonly operation: object;
    public readonly key = "x-fern-streaming";

    constructor({ breadcrumbs, operation, context }: FernStreamingExtension.Args) {
        super({ breadcrumbs, context });
        this.operation = operation;
    }

    public convert(): FernStreamingExtension.Output | undefined {
        const extensionValue = this.getExtensionValue(this.operation);
        if (extensionValue == null) {
            return undefined;
        }

        const result = StreamingExtensionSchema.safeParse(extensionValue);
        if (!result.success) {
            this.context.errorCollector.collect({
                message: `Invalid x-fern-streaming extension: ${result.error.message}`,
                path: this.breadcrumbs
            });
            return undefined;
        }

        if (typeof result.data === "boolean") {
            return result.data ? { type: "stream", format: "json", terminator: undefined } : undefined;
        }

        if (result.data["stream-condition"] == null && result.data.format != null) {
            return { type: "stream", format: result.data.format, terminator: result.data.terminator };
        }

        if (result.data["stream-condition"] == null) {
            this.context.errorCollector.collect({
                message: "Missing stream-condition property without specified format.",
                path: this.breadcrumbs
            });
            return undefined;
        }

        return {
            type: "streamCondition",
            format: result.data.format ?? "json",
            terminator: result.data.terminator,
            streamDescription: result.data["stream-description"],
            streamConditionProperty: AbstractConverterContext.maybeTrimPrefix(
                result.data["stream-condition"],
                REQUEST_PREFIX
            ),
            streamRequestName: result.data["stream-request-name"],
            responseStream: result.data["response-stream"],
            response: result.data.response
        };
    }
}
