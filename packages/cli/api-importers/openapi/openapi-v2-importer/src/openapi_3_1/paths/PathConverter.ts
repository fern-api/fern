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
            if (operation != null) {
                const operationBreadcrumbs = [...this.breadcrumbs, method];

                const webhookExtensionConverter = new FernWebhookExtension({
                    breadcrumbs: operationBreadcrumbs,
                    operation
                });
                const webhookExtension = webhookExtensionConverter.convert({ context, errorCollector });
                if (webhookExtension) {
                    const webhookConverter = new WebhookConverter({
                        breadcrumbs: operationBreadcrumbs,
                        operation,
                        method: OpenAPIV3.HttpMethods[method.toUpperCase() as keyof typeof OpenAPIV3.HttpMethods],
                        path: this.path
                    });
                    const convertedWebhook = await webhookConverter.convert({ context, errorCollector });
                    if (convertedWebhook != null) {
                        webhooks.push(convertedWebhook);
                        Object.assign(inlinedTypes, convertedWebhook.inlinedTypes);
                    }
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
                const idempotentExtension = idempotentExtensionConverter.convert({ context, errorCollector });

                const operationConverter = new OperationConverter({
                    breadcrumbs: operationBreadcrumbs,
                    operation,
                    method: OpenAPIV3.HttpMethods[method.toUpperCase() as keyof typeof OpenAPIV3.HttpMethods],
                    path: this.path,
                    idempotent: idempotentExtension
                });
                const convertedOperation = await operationConverter.convert({ context, errorCollector });
                if (convertedOperation != null) {
                    endpoints.push(convertedOperation);
                    Object.assign(inlinedTypes, convertedOperation.inlinedTypes);
                }
            }
        }

        return {
            endpoints,
            webhooks,
            inlinedTypes
        };
    }
}
