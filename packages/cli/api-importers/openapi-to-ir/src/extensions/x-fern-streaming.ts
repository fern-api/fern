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
    terminator: z.string().optional(),
    resumable: z.boolean().optional()
});

const StreamingExtensionSchema = z.union([z.boolean(), StreamingExtensionObjectSchema]);

type OnlyStreamingEndpoint = {
    type: "stream";
    format: "sse" | "json";
    terminator: string | undefined;
    resumable: boolean;
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
    resumable: boolean;
};

export declare namespace FernStreamingExtension {
    export interface Args extends AbstractExtension.Args {
        document: object;
        operation: object;
    }

    export type Output = OnlyStreamingEndpoint | StreamConditionEndpoint;
}

export class FernStreamingExtension extends AbstractExtension<FernStreamingExtension.Output> {
    private readonly document: object;
    private readonly operation: object;
    public readonly key = "x-fern-streaming";

    constructor({ breadcrumbs, document, operation, context }: FernStreamingExtension.Args) {
        super({ breadcrumbs, context });
        this.document = document;
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
            // Boolean shorthand emits format: "json", which has no Last-Event-ID semantics —
            // do not inherit resumable from the document for this case.
            return result.data
                ? { type: "stream", format: "json", terminator: undefined, resumable: false }
                : undefined;
        }

        const resumable = result.data.resumable ?? getDocumentLevelResumable(this.document) ?? false;

        if (result.data["stream-condition"] == null && result.data.format != null) {
            return { type: "stream", format: result.data.format, terminator: result.data.terminator, resumable };
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
            response: result.data.response,
            resumable
        };
    }
}

export function getDocumentLevelResumable(document: object): boolean | undefined {
    const docStreaming = (document as Record<string, unknown>)["x-fern-streaming"];
    if (docStreaming == null || typeof docStreaming === "boolean") {
        return undefined;
    }
    const resumable = (docStreaming as Record<string, unknown>).resumable;
    return typeof resumable === "boolean" ? resumable : undefined;
}
