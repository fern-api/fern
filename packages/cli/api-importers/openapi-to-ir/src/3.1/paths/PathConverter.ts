import { AuthScheme } from "@fern-api/ir-sdk";
import { AbstractConverter, Converters } from "@fern-api/v3-importer-commons";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { HttpMethods } from "../../constants/HttpMethods";
import { FernIdempotentExtension } from "../../extensions/x-fern-idempotent";
import { FernPaginationExtension } from "../../extensions/x-fern-pagination";
import { FernStreamingExtension } from "../../extensions/x-fern-streaming";
import { FernWebhookExtension } from "../../extensions/x-fern-webhook";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { OperationConverter } from "./operations/OperationConverter";
import { WebhookConverter } from "./operations/WebhookConverter";

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

    public async convert(): Promise<PathConverter.Output | undefined> {
        const endpoints: OperationConverter.Output[] = [];
        const webhooks: WebhookConverter.Output[] = [];
        const inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};

        for (const method of HttpMethods) {
            const operation = this.pathItem[method];

            if (operation == null) {
                continue;
            }

            const operationBreadcrumbs = [...this.breadcrumbs, method];

            const convertedWebhook = await this.tryParseAsWebhook({
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
            const streamingExtension = streamingExtensionConverter.convert();

            const convertedEndpoint = await this.tryParseAsHttpEndpoint({
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

    private async tryParseAsWebhook({
        operation,
        method,
        operationBreadcrumbs,
        context
    }: {
        operation: OpenAPIV3_1.OperationObject;
        method: string;
        operationBreadcrumbs: string[];
        context: OpenAPIConverterContext3_1;
    }): Promise<WebhookConverter.Output | undefined> {
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
        return await webhookConverter.convert();
    }

    private async tryParseAsHttpEndpoint({
        operation,
        method,
        operationBreadcrumbs,
        streamingExtension
    }: {
        operation: OpenAPIV3_1.OperationObject;
        method: string;
        operationBreadcrumbs: string[];
        streamingExtension: FernStreamingExtension.Output | undefined;
    }): Promise<OperationConverter.Output | undefined> {
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
            streamingExtension
        });
        return await operationConverter.convert();
    }
}
