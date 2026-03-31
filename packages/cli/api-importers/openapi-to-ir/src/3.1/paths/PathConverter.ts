import { AuthScheme } from "@fern-api/ir-sdk";
import { AbstractConverter, Converters } from "@fern-api/v3-importer-commons";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { HttpMethods } from "../../constants/HttpMethods.js";
import { FernIdempotentExtension } from "../../extensions/x-fern-idempotent.js";
import { FernPaginationExtension } from "../../extensions/x-fern-pagination.js";
import { FernStreamingExtension } from "../../extensions/x-fern-streaming.js";
import { FernWebhookExtension } from "../../extensions/x-fern-webhook.js";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1.js";
import { OperationConverter } from "./operations/OperationConverter.js";
import { WebhookConverter } from "./operations/WebhookConverter.js";

export declare namespace PathConverter {
    export interface Args extends AbstractConverter.Args<OpenAPIConverterContext3_1> {
        pathItem: OpenAPIV3_1.PathItemObject;
        path: string;
        topLevelServers?: OpenAPIV3_1.ServerObject[];
        idToAuthScheme?: Record<string, AuthScheme>;
    }

    export interface Output {
        endpoints: OperationConverter.Output[];
        webhooks: WebhookConverter.Output[];
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}

export class PathConverter extends AbstractConverter<OpenAPIConverterContext3_1, PathConverter.Output> {
    private readonly pathItem: OpenAPIV3_1.PathItemObject;
    private readonly path: string;
    private readonly idToAuthScheme?: Record<string, AuthScheme>;
    private readonly topLevelServers?: OpenAPIV3_1.ServerObject[];

    constructor({ context, breadcrumbs, pathItem, path, idToAuthScheme, topLevelServers }: PathConverter.Args) {
        super({ context, breadcrumbs });
        this.pathItem = pathItem;
        this.path = path;
        this.idToAuthScheme = idToAuthScheme;
        this.topLevelServers = topLevelServers;
    }

    public convert(): PathConverter.Output | undefined {
        const endpoints: OperationConverter.Output[] = [];
        const webhooks: WebhookConverter.Output[] = [];
        const inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};

        for (const method of HttpMethods) {
            const operation = this.pathItem[method];

            if (operation == null) {
                continue;
            }

            const operationBreadcrumbs = [...this.breadcrumbs, method];

            const convertedWebhook = this.tryParseAsWebhook({
                operationBreadcrumbs,
                operation,
                method,
                context: this.context
            });
            if (convertedWebhook != null) {
                webhooks.push(convertedWebhook);
                Object.assign(inlinedTypes, convertedWebhook.inlinedTypes);
                continue;
            }

            const streamingExtensionConverter = new FernStreamingExtension({
                breadcrumbs: operationBreadcrumbs,
                operation,
                context: this.context
            });
            let streamingExtension = streamingExtensionConverter.convert();

            // If no x-fern-streaming extension is specified, check if the response has
            // text/event-stream content type. This infers streaming based on the MIME type.
            if (streamingExtension == null) {
                const hasTextEventStream = this.operationHasTextEventStreamResponse(operation);
                if (hasTextEventStream) {
                    streamingExtension = { type: "stream", format: "sse", terminator: undefined };
                }
            }

            const convertedEndpoint = this.tryParseAsHttpEndpoint({
                operationBreadcrumbs,
                operation,
                method,
                streamingExtension
            });
            if (convertedEndpoint != null) {
                endpoints.push(convertedEndpoint);
                Object.assign(inlinedTypes, convertedEndpoint.inlinedTypes);
            }
        }

        return {
            endpoints,
            webhooks,
            inlinedTypes
        };
    }

    private tryParseAsWebhook({
        operation,
        method,
        operationBreadcrumbs,
        context
    }: {
        operation: OpenAPIV3_1.OperationObject;
        method: string;
        operationBreadcrumbs: string[];
        context: OpenAPIConverterContext3_1;
    }): WebhookConverter.Output | undefined {
        const webhookExtensionConverter = new FernWebhookExtension({
            breadcrumbs: operationBreadcrumbs,
            operation,
            context
        });
        const webhookExtension = webhookExtensionConverter.convert();
        if (!webhookExtension) {
            return undefined;
        }

        const webhookConverter = new WebhookConverter({
            context: this.context,
            breadcrumbs: operationBreadcrumbs,
            operation,
            method: OpenAPIV3.HttpMethods[method.toUpperCase() as keyof typeof OpenAPIV3.HttpMethods],
            path: this.path
        });
        return webhookConverter.convert();
    }

    /**
     * Checks if the operation has a response where text/event-stream is the only content type.
     * When multiple content types are present (e.g., both application/json and text/event-stream),
     * we don't infer streaming — the user should use x-fern-streaming to explicitly configure it.
     */
    private operationHasTextEventStreamResponse(operation: OpenAPIV3_1.OperationObject): boolean {
        if (operation.responses == null) {
            return false;
        }
        for (const [statusCode, response] of Object.entries(operation.responses)) {
            const statusCodeNum = parseInt(statusCode);
            if (isNaN(statusCodeNum) || statusCodeNum < 200 || statusCodeNum >= 300) {
                continue;
            }
            const resolvedResponse = this.context.resolveMaybeReference<OpenAPIV3_1.ResponseObject>({
                schemaOrReference: response,
                breadcrumbs: this.breadcrumbs
            });
            if (resolvedResponse?.content == null) {
                continue;
            }
            const contentTypes = Object.keys(resolvedResponse.content);
            if (contentTypes.length === 1 && contentTypes[0]?.includes("text/event-stream")) {
                return true;
            }
        }
        return false;
    }

    private tryParseAsHttpEndpoint({
        operation,
        method,
        operationBreadcrumbs,
        streamingExtension
    }: {
        operation: OpenAPIV3_1.OperationObject;
        method: string;
        operationBreadcrumbs: string[];
        streamingExtension: FernStreamingExtension.Output | undefined;
    }): OperationConverter.Output | undefined {
        const paginationExtensionConverter = new FernPaginationExtension({
            breadcrumbs: operationBreadcrumbs,
            operation,
            document: this.context.spec as OpenAPIV3.Document,
            context: this.context
        });
        const paginationExtension = paginationExtensionConverter.convert();
        if (paginationExtension != null) {
            // TODO: Use pagination extension to modify endpoint conversion.
            // Correctly parse out the pagination ResponseProperty objects
        }

        const idempotentExtensionConverter = new FernIdempotentExtension({
            breadcrumbs: operationBreadcrumbs,
            operation,
            context: this.context
        });
        const isIdempotent = idempotentExtensionConverter.convert();

        const operationConverter = new OperationConverter({
            context: this.context,
            breadcrumbs: operationBreadcrumbs,
            operation,
            method: OpenAPIV3.HttpMethods[method.toUpperCase() as keyof typeof OpenAPIV3.HttpMethods],
            path: this.path,
            idempotent: isIdempotent,
            idToAuthScheme: this.idToAuthScheme,
            topLevelServers: this.topLevelServers,
            pathLevelServers: this.pathItem.servers,
            streamingExtension
        });
        return operationConverter.convert();
    }
}
