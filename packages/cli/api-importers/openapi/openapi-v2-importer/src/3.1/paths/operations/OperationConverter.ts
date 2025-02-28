import { OpenAPIV3_1 } from "openapi-types";

import { HttpRequestBody, HttpResponse } from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";

import { ErrorCollector } from "../../../ErrorCollector";
import { OpenAPIConverterContext3_1 } from "../../OpenAPIConverterContext3_1";
import { RequestBodyConverter } from "../RequestBodyConverter";
import { ResponseBodyConverter } from "../ResponseBodyConverter";
import { AbstractOperationConverter } from "./AbstractOperationConverter";

export declare namespace OperationConverter {
    export interface Args extends AbstractOperationConverter.Args {
        operation: OpenAPIV3_1.OperationObject;
        method: OpenAPIV3_1.HttpMethods;
        path: string;
    }
}

export class OperationConverter extends AbstractOperationConverter {
    constructor({ breadcrumbs, operation, method, path }: OperationConverter.Args) {
        super({ breadcrumbs, operation, method, path });
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): AbstractOperationConverter.Output | undefined {
        const httpMethod = this.convertHttpMethod();
        if (httpMethod == null) {
            return undefined;
        }

        const { group, method } =
            this.computeGroupNameAndLocationFromExtensions({ context, errorCollector }) ??
            this.computeGroupNameFromTagAndOperationId({ context, errorCollector });

        const { headers, pathParameters, queryParameters } = this.convertParameters({ context, errorCollector });

        let requestBody: HttpRequestBody | undefined;
        if (this.operation.requestBody != null) {
            let resolvedRequestBody: OpenAPIV3_1.RequestBodyObject | undefined = undefined;
            if (context.isReferenceObject(this.operation.requestBody)) {
                const resolvedReference = context.resolveReference<OpenAPIV3_1.RequestBodyObject>(
                    this.operation.requestBody
                );
                if (resolvedReference.resolved) {
                    resolvedRequestBody = resolvedReference.value;
                }
            } else {
                resolvedRequestBody = this.operation.requestBody;
            }

            if (resolvedRequestBody == null) {
                return undefined;
            }

            const requestBodyConverter = new RequestBodyConverter({
                breadcrumbs: [...this.breadcrumbs, "requestBody"],
                requestBody: resolvedRequestBody,
                group: group ?? [],
                method
            });
            const convertedRequestBody = requestBodyConverter.convert({ context, errorCollector });

            if (convertedRequestBody != null) {
                requestBody = convertedRequestBody.requestBody;
                this.inlinedTypes = {
                    ...this.inlinedTypes,
                    ...convertedRequestBody.inlinedTypes
                };
            }
        }

        let httpResponse: HttpResponse | undefined;
        if (this.operation.responses != null) {
            for (const [statusCode, response] of Object.entries(this.operation.responses)) {
                // TODO: Handle non 2xx status codes
                const statusCodeNum = parseInt(statusCode);
                if (isNaN(statusCodeNum) || statusCodeNum < 200 || statusCodeNum >= 300) {
                    continue;
                }

                let resolvedResponse: OpenAPIV3_1.ResponseObject | undefined = undefined;
                if (context.isReferenceObject(response)) {
                    const resolvedReference = context.resolveReference<OpenAPIV3_1.ResponseObject>(response);
                    if (resolvedReference.resolved) {
                        resolvedResponse = resolvedReference.value;
                    }
                } else {
                    resolvedResponse = response;
                }

                if (resolvedResponse == null) {
                    continue;
                }

                const responseBodyConverter = new ResponseBodyConverter({
                    breadcrumbs: [...this.breadcrumbs, "responses", statusCode],
                    responseBody: resolvedResponse,
                    group: group ?? [],
                    method,
                    statusCode
                });
                const convertedResponseBody = responseBodyConverter.convert({ context, errorCollector });
                if (convertedResponseBody != null) {
                    httpResponse = {
                        statusCode: statusCodeNum,
                        body: convertedResponseBody.responseBody
                    };
                    this.inlinedTypes = {
                        ...this.inlinedTypes,
                        ...convertedResponseBody.inlinedTypes
                    };
                    break;
                }
            }
        }

        // TODO: Convert operation parameters, request body, responses
        return {
            group,
            endpoint: {
                id: `${group?.join(".") ?? ""}.${method}`,
                displayName: this.operation.summary,
                method: httpMethod,
                name: context.casingsGenerator.generateName(method),
                baseUrl: undefined,
                path: constructHttpPath(this.path),
                pathParameters,
                queryParameters,
                headers,
                requestBody,
                sdkRequest: undefined,
                response: httpResponse,
                errors: [],
                auth: this.operation.security != null || context.spec.security != null,
                availability: context.getAvailability({
                    node: this.operation,
                    breadcrumbs: this.breadcrumbs,
                    errorCollector
                }),
                docs: this.operation.description,
                userSpecifiedExamples: [],
                autogeneratedExamples: [],
                idempotent: false,
                basePath: undefined,
                fullPath: constructHttpPath(this.path),
                allPathParameters: pathParameters,
                pagination: undefined,
                transport: undefined
            },
            inlinedTypes: this.inlinedTypes
        };
    }
}
