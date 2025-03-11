import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { TypeDeclaration } from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { HttpMethods } from "../../constants/HttpMethods";
import { FernIdempotentExtension } from "../../extensions/x-fern-idempotent";
import { FernPaginationExtension } from "../../extensions/x-fern-pagination";
import { FernStreamingExtension } from "../../extensions/x-fern-streaming";
import { FernWebhookExtension } from "../../extensions/x-fern-webhook";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { OperationConverter } from "./operations/OperationConverter";
import { WebhookConverter } from "./operations/WebhookConverter";

export declare namespace PathConverter {
    export interface Args extends AbstractConverter.Args {
        pathItem: OpenAPIV3_1.PathItemObject;
        path: string;
    }

    export interface Output {
        endpoints: OperationConverter.Output[];
        webhooks: WebhookConverter.Output[];
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

export class PathConverter extends AbstractConverter<OpenAPIConverterContext3_1, PathConverter.Output> {
    private readonly pathItem: OpenAPIV3_1.PathItemObject;
    private readonly path: string;

    constructor({ breadcrumbs, pathItem, path }: PathConverter.Args) {
        super({ breadcrumbs });
        this.pathItem = pathItem;
        this.path = path;
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<PathConverter.Output | undefined> {
        const endpoints: OperationConverter.Output[] = [];
        const webhooks: WebhookConverter.Output[] = [];
        const inlinedTypes: Record<string, TypeDeclaration> = {};

        for (const method of HttpMethods) {
            const operation = this.pathItem[method];

            if (operation == null) {
                // TODO: log the skip here
                continue;
            }

            const operationBreadcrumbs = [...this.breadcrumbs, method];

            const convertedWebhook = await this.tryParseAsWebhook({
                operationBreadcrumbs,
                operation,
                method,
                context,
                errorCollector
            });
            if (convertedWebhook != null) {
                webhooks.push(convertedWebhook);
                Object.assign(inlinedTypes, convertedWebhook.inlinedTypes);
                continue;
            }

            const streamingExtensionConverter = new FernStreamingExtension({
                breadcrumbs: operationBreadcrumbs,
                operation
            });
            const streamingExtension = streamingExtensionConverter.convert({ context, errorCollector });
            if (streamingExtension != null) {
                // TODO: Use streaming extension to branch between streaming and non-streaming endpoints
                // Use streamFormat to modify response conversion.
            }

            const convertedEndpoint = await this.tryParseAsHttpEndpoint({
                operationBreadcrumbs,
                operation,
                method,
                context,
                errorCollector
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
        context,
        errorCollector
    }: {
        operation: OpenAPIV3_1.OperationObject;
        method: string;
        operationBreadcrumbs: string[];
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<WebhookConverter.Output | undefined> {
        const webhookExtensionConverter = new FernWebhookExtension({
            breadcrumbs: operationBreadcrumbs,
            operation
        });
        const webhookExtension = webhookExtensionConverter.convert({ context, errorCollector });
        if (!webhookExtension) {
            return undefined;
        }

        const webhookConverter = new WebhookConverter({
            breadcrumbs: operationBreadcrumbs,
            operation,
            method: OpenAPIV3.HttpMethods[method.toUpperCase() as keyof typeof OpenAPIV3.HttpMethods],
            path: this.path
        });
        return await webhookConverter.convert({ context, errorCollector });
    }

    private async tryParseAsHttpEndpoint({
        operation,
        method,
        operationBreadcrumbs,
        context,
        errorCollector
    }: {
        operation: OpenAPIV3_1.OperationObject;
        method: string;
        operationBreadcrumbs: string[];
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<OperationConverter.Output | undefined> {
        const paginationExtensionConverter = new FernPaginationExtension({
            breadcrumbs: operationBreadcrumbs,
            operation,
            document: context.spec as OpenAPIV3.Document
        });
        const paginationExtension = paginationExtensionConverter.convert({ context, errorCollector });
        if (paginationExtension != null) {
            // TODO: Use pagination extension to modify endpoint conversion.
            // Correctly parse out the pagination ResponseProperty objects
        }

        const idempotentExtensionConverter = new FernIdempotentExtension({
            breadcrumbs: operationBreadcrumbs,
            operation
        });
        const isIdempotent = idempotentExtensionConverter.convert({ context, errorCollector });

        const operationConverter = new OperationConverter({
            breadcrumbs: operationBreadcrumbs,
            operation,
            method: OpenAPIV3.HttpMethods[method.toUpperCase() as keyof typeof OpenAPIV3.HttpMethods],
            path: this.path,
            idempotent: isIdempotent
        });
        return await operationConverter.convert({ context, errorCollector });
    }
}
