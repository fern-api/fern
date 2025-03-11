import { camelCase, compact, isEqual } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import {
    HttpHeader,
    HttpMethod,
    HttpRequestBody,
    HttpResponse,
    PathParameter,
    QueryParameter,
    TypeDeclaration
} from "@fern-api/ir-sdk";

import { AbstractConverter } from "../../../AbstractConverter";
import { ErrorCollector } from "../../../ErrorCollector";
import { SdkGroupNameExtension } from "../../../extensions/x-fern-sdk-group-name";
import { SdkMethodNameExtension } from "../../../extensions/x-fern-sdk-method-name";
import { GroupNameAndLocation } from "../../../types/GroupNameAndLocation";
import { OpenAPIConverterContext3_1 } from "../../OpenAPIConverterContext3_1";
import { ParameterConverter } from "../ParameterConverter";
import { RequestBodyConverter } from "../RequestBodyConverter";
import { ResponseBodyConverter } from "../ResponseBodyConverter";

const PATH_PARAM_REGEX = /{([^}]+)}/g;

export declare namespace AbstractOperationConverter {
    export interface Args extends AbstractConverter.Args {
        operation: OpenAPIV3_1.OperationObject;
        method: OpenAPIV3_1.HttpMethods;
        path: string;
    }

    export interface Output {
        group?: string[];
        inlinedTypes: Record<string, TypeDeclaration>;
    }
}

interface ConvertedRequestBody {
    value: HttpRequestBody;
    examples?: Record<string, OpenAPIV3_1.ExampleObject>;
}
interface ConvertedResponseBody {
    value: HttpResponse;
    examples?: Record<string, OpenAPIV3_1.ExampleObject>;
}

export abstract class AbstractOperationConverter extends AbstractConverter<
    OpenAPIConverterContext3_1,
    AbstractOperationConverter.Output
> {
    protected readonly operation: OpenAPIV3_1.OperationObject;
    protected readonly method: OpenAPIV3_1.HttpMethods;
    protected readonly path: string;
    protected inlinedTypes: Record<string, TypeDeclaration> = {};

    constructor({ breadcrumbs, operation, method, path }: AbstractOperationConverter.Args) {
        super({ breadcrumbs });
        this.operation = operation;
        this.method = method;
        this.path = path;
    }

    public abstract convert({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): Promise<AbstractOperationConverter.Output | undefined>;

    protected convertHttpMethod(): HttpMethod | undefined {
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

    protected async convertParameters({
        context,
        errorCollector,
        breadcrumbs
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
        breadcrumbs: string[];
    }): Promise<{
        pathParameters: PathParameter[];
        queryParameters: QueryParameter[];
        headers: HttpHeader[];
    }> {
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
                breadcrumbs,
                parameter
            });

            const convertedParameter = await parameterConverter.convert({ context, errorCollector });
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

        const pathParams = [...this.path.matchAll(PATH_PARAM_REGEX)].map((match) => match[1]);
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

    protected async convertRequestBody({
        context,
        errorCollector,
        breadcrumbs,
        group,
        method
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
        breadcrumbs: string[];
        group: string[] | undefined;
        method: string;
    }): Promise<ConvertedRequestBody | undefined | null> {
        if (this.operation.requestBody == null) {
            return undefined;
        }

        let resolvedRequestBody: OpenAPIV3_1.RequestBodyObject | undefined = undefined;
        if (context.isReferenceObject(this.operation.requestBody)) {
            const resolvedReference = await context.resolveReference<OpenAPIV3_1.RequestBodyObject>(
                this.operation.requestBody
            );
            if (resolvedReference.resolved) {
                resolvedRequestBody = resolvedReference.value;
            }
        } else {
            resolvedRequestBody = this.operation.requestBody;
        }

        if (resolvedRequestBody == null) {
            return null;
        }

        const requestBodyConverter = new RequestBodyConverter({
            breadcrumbs,
            requestBody: resolvedRequestBody,
            group: group ?? [],
            method
        });
        const convertedRequestBody = await requestBodyConverter.convert({ context, errorCollector });

        if (convertedRequestBody != null) {
            this.inlinedTypes = {
                ...this.inlinedTypes,
                ...convertedRequestBody.inlinedTypes
            };
            return { value: convertedRequestBody.requestBody, examples: convertedRequestBody.examples };
        }

        return undefined;
    }

    protected async convertResponseBody({
        context,
        errorCollector,
        breadcrumbs,
        group,
        method
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
        breadcrumbs: string[];
        group: string[] | undefined;
        method: string;
    }): Promise<ConvertedResponseBody | undefined> {
        if (this.operation.responses == null) {
            return undefined;
        }

        for (const [statusCode, response] of Object.entries(this.operation.responses)) {
            const statusCodeNum = parseInt(statusCode);
            if (isNaN(statusCodeNum) || statusCodeNum < 200 || statusCodeNum >= 300) {
                continue;
            }

            let resolvedResponse: OpenAPIV3_1.ResponseObject | undefined = undefined;
            if (context.isReferenceObject(response)) {
                const resolvedReference = await context.resolveReference<OpenAPIV3_1.ResponseObject>(response);
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
                breadcrumbs: [...breadcrumbs, statusCode],
                responseBody: resolvedResponse,
                group: group ?? [],
                method,
                statusCode
            });
            const convertedResponseBody = await responseBodyConverter.convert({ context, errorCollector });
            if (convertedResponseBody != null) {
                this.inlinedTypes = {
                    ...this.inlinedTypes,
                    ...convertedResponseBody.inlinedTypes
                };
                return {
                    value: {
                        statusCode: statusCodeNum,
                        body: convertedResponseBody.responseBody
                    },
                    examples: convertedResponseBody.examples
                };
            }
        }

        return undefined;
    }

    protected computeGroupNameAndLocationFromExtensions({
        context,
        errorCollector
    }: {
        context: OpenAPIConverterContext3_1;
        errorCollector: ErrorCollector;
    }): GroupNameAndLocation | undefined {
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

    protected computeGroupNameFromTagAndOperationId({
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
        return this.computeGroupAndMethodFromTokens({
            tag,
            tagTokens,
            operationId,
            operationIdTokens
        });
    }

    protected computeGroupAndMethodFromTokens({
        tag,
        tagTokens,
        operationId,
        operationIdTokens
    }: {
        tag: string;
        tagTokens: string[];
        operationId: string;
        operationIdTokens: string[];
    }): GroupNameAndLocation {
        const tagIsNotPrefixOfOperationId = tagTokens.some((tagToken, index) => tagToken !== operationIdTokens[index]);

        if (tagIsNotPrefixOfOperationId) {
            return {
                group: [tag],
                method: operationId
            };
        }

        const methodTokens = operationIdTokens.slice(tagTokens.length);
        return {
            group: [tag],
            method: camelCase(methodTokens.join("_"))
        };
    }
}

function tokenizeString(input: string): string[] {
    let tokens = isCamelOrPascalCase(input) ? splitOnCapitalLetters(input) : splitOnNonAlphanumericCharacters(input);
    tokens = tokens.map((token) => token.toLowerCase());
    tokens = compact(tokens);
    return tokens;
}

function isCamelOrPascalCase(input: string): boolean {
    return /^[a-z]+(?:[A-Z][a-z]+)*$/.test(input);
}

function splitOnCapitalLetters(input: string): string[] {
    return input.split(/(?=[A-Z])/);
}

function splitOnNonAlphanumericCharacters(input: string): string[] {
    return input.split(/[^a-zA-Z0-9]+/);
}
