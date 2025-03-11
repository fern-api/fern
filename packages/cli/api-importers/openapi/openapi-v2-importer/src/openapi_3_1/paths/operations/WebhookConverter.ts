import { HttpRequestBody, Webhook, WebhookPayload } from "@fern-api/ir-sdk";

import { ErrorCollector } from "../../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../../OpenAPIConverterContext3_1";
import { AbstractOperationConverter } from "./AbstractOperationConverter";

export declare namespace WebhookConverter {
    export interface Output extends AbstractOperationConverter.Output {
        webhook: Webhook;
    }
}

export class WebhookConverter extends AbstractOperationConverter {
    constructor({ breadcrumbs, operation, method, path }: AbstractOperationConverter.Args) {
        super({ breadcrumbs, operation, method, path });
    }

    public async convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<WebhookConverter.Output | undefined> {
        if (this.operation.operationId == null) {
            errorCollector.collect({
                message: "Skipping webhook because no operation id present",
                path: this.breadcrumbs
            });
            return undefined;
        }
        if (this.operation.requestBody == null) {
            errorCollector.collect({
                message: "Skipping webhook because no request body present",
                path: this.breadcrumbs
            });
            return undefined;
        }

        const httpMethod = this.convertHttpMethod();
        if (httpMethod == null) {
            return undefined;
        }

        if (httpMethod !== "POST" && httpMethod !== "GET") {
            errorCollector.collect({
                message: "Skipping webhook because non-POST or GET method",
                path: this.breadcrumbs
            });
            return undefined;
        }

        const { group, method } =
            this.computeGroupNameAndLocationFromExtensions({ context, errorCollector }) ??
            this.computeGroupNameFromTagAndOperationId({ context, errorCollector });

        const payloadBreadcrumbs = [...this.breadcrumbs, "Payload"];
        const { headers, pathParameters, queryParameters } = await this.convertParameters({
            context,
            errorCollector,
            breadcrumbs: payloadBreadcrumbs
        });

        const requestBody = await this.convertRequestBody({
            context,
            errorCollector,
            breadcrumbs: payloadBreadcrumbs,
            group,
            method
        });
        if (requestBody == null || !("contentType" in requestBody) || !requestBody.contentType?.includes("json")) {
            errorCollector.collect({
                message: "Skipping webhook because non-json request body",
                path: this.breadcrumbs
            });
            return undefined;
        }

        let payload: WebhookPayload;
        if ("inlinedRequestBody" in requestBody) {
            const inlinedRequestBody = requestBody.inlinedRequestBody as HttpRequestBody.InlinedRequestBody;
            payload = WebhookPayload.inlinedPayload({
                name: inlinedRequestBody.name,
                extends: inlinedRequestBody.extends,
                properties: inlinedRequestBody.properties
            });
        } else {
            const reference = requestBody as HttpRequestBody.Reference;
            payload = WebhookPayload.reference({
                payloadType: reference.requestBodyType,
                docs: reference.docs
            });
        }

        return {
            group,
            webhook: {
                id: `${group?.join(".") ?? ""}.${method}`,
                name: context.casingsGenerator.generateName(method),
                displayName: this.operation.summary,
                method: httpMethod,
                headers,
                payload,
                examples: [],
                availability: await context.getAvailability({
                    node: this.operation,
                    breadcrumbs: this.breadcrumbs,
                    errorCollector
                }),
                docs: this.operation.description
            },
            inlinedTypes: this.inlinedTypes
        };
    }
}
