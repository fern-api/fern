import { Webhook, WebhookPayload } from "@fern-api/ir-sdk";
import { ErrorCollector } from "@fern-api/v2-importer-commons";

import { OpenAPIConverterContext3_1 } from "../../OpenAPIConverterContext3_1";
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

    public async convert({
        errorCollector
    }: {
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
            this.computeGroupNameAndLocationFromExtensions({ errorCollector }) ??
            this.computeGroupNameFromTagAndOperationId({ errorCollector });

        const payloadBreadcrumbs = [...this.breadcrumbs, "Payload"];
        const { headers, pathParameters, queryParameters } = await this.convertParameters({
            errorCollector,
            breadcrumbs: payloadBreadcrumbs
        });

        const requestBody = await this.convertRequestBody({
            errorCollector,
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
                    breadcrumbs: this.breadcrumbs,
                    errorCollector
                }),
                docs: this.operation.description,
                v2Examples: undefined
            },
            inlinedTypes: this.inlinedTypes
        };
    }
}
