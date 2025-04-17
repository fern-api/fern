import { Webhook, WebhookPayload } from "@fern-api/ir-sdk";

import { AbstractOperationConverter } from "./AbstractOperationConverter";

export declare namespace WebhookConverter {
    export interface Output extends AbstractOperationConverter.Output {
        webhook: Webhook;
    }
}

export class WebhookConverter extends AbstractOperationConverter {
    constructor({ context, breadcrumbs, operation, method, path }: AbstractOperationConverter.Args) {
        super({ context, breadcrumbs, operation, method, path });
    }

    public async convert(): Promise<WebhookConverter.Output | undefined> {
        if (this.operation.operationId == null) {
            this.context.errorCollector.collect({
                message: "Skipping webhook because no operation id present",
                path: this.breadcrumbs
            });
            return undefined;
        }
        if (this.operation.requestBody == null) {
            this.context.errorCollector.collect({
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
            this.context.errorCollector.collect({
                message: "Skipping webhook because non-POST or GET method",
                path: this.breadcrumbs
            });
            return undefined;
        }

        const { group, method } =
            this.computeGroupNameAndLocationFromExtensions() ?? this.computeGroupNameFromTagAndOperationId();

        const payloadBreadcrumbs = [...this.breadcrumbs, "Payload"];
        const { headers, pathParameters, queryParameters } = await this.convertParameters({
            breadcrumbs: payloadBreadcrumbs
        });

        const requestBody = await this.convertRequestBody({
            breadcrumbs: payloadBreadcrumbs,
            group,
            method
        });

        let payload: WebhookPayload;
        if (requestBody?.value.type === "inlinedRequestBody") {
            payload = WebhookPayload.inlinedPayload({
                name: requestBody.value.name,
                extends: requestBody.value.extends,
                properties: requestBody.value.properties
            });
        } else if (requestBody?.value.type === "reference") {
            payload = WebhookPayload.reference({
                payloadType: requestBody.value.requestBodyType,
                docs: requestBody.value.docs
            });
        } else {
            return undefined;
        }

        return {
            group,
            webhook: {
                id: `${group?.join(".") ?? ""}.${method}`,
                name: this.context.casingsGenerator.generateName(method),
                displayName: this.operation.summary,
                method: httpMethod,
                headers,
                payload,
                examples: [],
                availability: await this.context.getAvailability({
                    node: this.operation,
                    breadcrumbs: this.breadcrumbs
                }),
                docs: this.operation.description,
                v2Examples: undefined
            },
            inlinedTypes: this.inlinedTypes
        };
    }
}
