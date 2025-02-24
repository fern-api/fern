import { camelCase, compact, isEqual } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import {
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpRequestBody,
    HttpResponse,
    PathParameter,
    QueryParameter,
    TypeDeclaration
} from "@fern-api/ir-sdk";
import { constructHttpPath } from "@fern-api/ir-utils";

import { AbstractConverter } from "../../AbstractConverter";
import { ErrorCollector } from "../../ErrorCollector";
import { SdkGroupNameExtension } from "../../extensions/x-fern-sdk-group-name";
import { SdkMethodNameExtension } from "../../extensions/x-fern-sdk-method-name";
import { OpenAPIConverterContext3_1 } from "../OpenAPIConverterContext3_1";
import { ParameterConverter } from "./ParameterConverter";
import { RequestBodyConverter } from "./RequestBodyConverter";
import { ResponseBodyConverter } from "./ResponseBodyConverter";

export declare namespace OperationConverter {
    export interface Args extends AbstractConverter.Args {
        operation: OpenAPIV3_1.OperationObject;
        method: OpenAPIV3_1.HttpMethods;
        path: string;
    }

    export interface Output {
        group?: string[];
        endpoint: HttpEndpoint;
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

interface GroupNameAndLocation {
    group?: string[];
    method: string;
}

export class OperationConverter extends AbstractConverter<OpenAPIConverterContext3_1, OperationConverter.Output> {
    private readonly operation: OpenAPIV3_1.OperationObject;
    private readonly method: OpenAPIV3_1.HttpMethods;
    private readonly path: string;
    private inlinedTypes: Record<string, TypeDeclaration> = {};

    constructor({ breadcrumbs, operation, method, path }: OperationConverter.Args) {
        super({ breadcrumbs });
        this.operation = operation;
        this.method = method;
        this.path = path;
    }

    public convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): OperationConverter.Output | undefined {
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
                // Skip if not a 2xx status code
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
                availability: undefined,
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

    private convertHttpMethod(): HttpMethod | undefined {
        switch (this.method) {
            case "get":
                return HttpMethod.Get;
            case "post":
                return HttpMethod.Post;
            case "put":
                return HttpMethod.Put;
            case "delete":
                return HttpMethod.Delete;
            case "patch":
                return HttpMethod.Patch;
            default:
                return undefined;
        }
    }

    private convertParameters({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): {
        pathParameters: PathParameter[];
        queryParameters: QueryParameter[];
        headers: HttpHeader[];
    } {
        const pathParameters: PathParameter[] = [];
        const queryParameters: QueryParameter[] = [];
        const headers: HttpHeader[] = [];

        if (!this.operation.parameters) {
            return { pathParameters, queryParameters, headers };
        }

        for (const parameter of this.operation.parameters) {
            if (context.isReferenceObject(parameter)) {
                continue;
            }

            const parameterConverter = new ParameterConverter({
                breadcrumbs: [...this.breadcrumbs, "parameters"],
                parameter
            });

            const convertedParameter = parameterConverter.convert({ context, errorCollector });
            if (convertedParameter != null) {
                this.inlinedTypes = { ...this.inlinedTypes, ...convertedParameter.inlinedTypes };
                switch (convertedParameter.type) {
                    case "path":
                        pathParameters.push(convertedParameter.parameter);
                        break;
                    case "query":
                        queryParameters.push(convertedParameter.parameter);
                        break;
                    case "header":
                        headers.push(convertedParameter.parameter);
                        break;
                }
            }
        }

        // Parse path parameters from URL
        const PATH_PARAM_REGEX = /{([^}]+)}/g;
        const pathParams = [...this.path.matchAll(PATH_PARAM_REGEX)].map((match) => match[1]);

        // Check if any path parameters are missing and add them
        const missingPathParams = pathParams.filter(
            (param) => !pathParameters.some((p) => p.name.originalName === param)
        );
        for (const param of missingPathParams) {
            if (param == null) {
                continue;
            }
            pathParameters.push({
                name: context.casingsGenerator.generateName(param),
                valueType: ParameterConverter.STRING,
                docs: undefined,
                location: "ENDPOINT",
                variable: undefined
            });
        }

        return {
            pathParameters,
            queryParameters,
            headers
        };
    }

    private computeGroupNameAndLocationFromExtensions({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): GroupNameAndLocation | undefined {
        // Compute from `x-fern-sdk-method-name` and `x-fern-sdk-group-name`
        const methodNameExtension = new SdkMethodNameExtension({
            breadcrumbs: this.breadcrumbs,
            operation: this.operation
        });
        const method = methodNameExtension.convert({ context, errorCollector })?.methodName;

        const groupNameExtension = new SdkGroupNameExtension({
            breadcrumbs: this.breadcrumbs,
            operation: this.operation
        });
        const group = groupNameExtension.convert({ context, errorCollector })?.groups ?? [];

        if (method != null) {
            return { group, method };
        }

        return undefined;
    }

    private computeGroupNameFromTagAndOperationId({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): GroupNameAndLocation {
        const tag = this.operation.tags?.[0];
        const operationId = this.operation.operationId;

        if (operationId == null) {
            const methodName =
                this.operation.summary != null
                    ? camelCase(this.operation.summary)
                    : camelCase(`${this.method}_${this.path.split("/").join("_")}`);

            return tag != null ? { group: [tag], method: methodName } : { method: methodName };
        }

        if (tag == null) {
            return { method: operationId };
        }

        const tagTokens = tokenizeString(tag);
        const operationIdTokens = tokenizeString(operationId);

        if (isEqual(tagTokens, operationIdTokens)) {
            return {
                method: tag
            };
        }

        // Check if tag and operationId share a common prefix
        for (let i = 0; i < tagTokens.length; ++i) {
            const tagToken = tagTokens[i];
            const operationIdToken = operationIdTokens[i];

            // If tokens don't match, tag and operationId have diverged
            if (tagToken == null || tagToken !== operationIdToken) {
                return {
                    group: [tag],
                    method: operationId
                };
            }
        }

        // If we get here, tag is a prefix of operationId
        // Return the remaining tokens of operationId as the method name
        return {
            group: [tag],
            method: camelCase(operationIdTokens.slice(tagTokens.length).join("_"))
        };
    }
}

/**
 * Splits a string into tokens based on its format (camelCase, PascalCase, snake_case etc)
 * - For camelCase/PascalCase: splits on capital letters
 * - For snake_case or other formats: splits on non-alphanumeric characters
 * All tokens are converted to lowercase and empty tokens are filtered out
 * @param input The string to tokenize
 * @returns Array of lowercase string tokens
 */
function tokenizeString(input: string): string[] {
    let tokens: string[];

    // Check if the string is in camel case or Pascal case
    if (/^[a-z]+(?:[A-Z][a-z]+)*$/.test(input)) {
        // Camel case or Pascal case: Split based on capital letters
        tokens = input.split(/(?=[A-Z])/);
    } else {
        // Snake case or non-alphanumeric separators: Split based on non-alphanumeric characters
        tokens = input.split(/[^a-zA-Z0-9]+/);
    }

    tokens = tokens.map((token) => token.toLowerCase());

    // Filter out empty tokens
    tokens = compact(tokens);

    return tokens;
}
