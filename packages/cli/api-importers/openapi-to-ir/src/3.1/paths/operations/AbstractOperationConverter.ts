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
import { AbstractConverter, Converters, Extensions } from "@fern-api/v2-importer-commons";

import { FernStreamingExtension } from "../../../extensions/x-fern-streaming";
import { GroupNameAndLocation } from "../../../types/GroupNameAndLocation";
import { OpenAPIConverter } from "../../OpenAPIConverter";
import { OpenAPIConverterContext3_1 } from "../../OpenAPIConverterContext3_1";
import { ParameterConverter } from "../ParameterConverter";
import { RequestBodyConverter } from "../RequestBodyConverter";
import { ResponseBodyConverter } from "../ResponseBodyConverter";
import { ResponseErrorConverter } from "../ResponseErrorConverter";

const PATH_PARAM_REGEX = /{([^}]+)}/g;

export declare namespace AbstractOperationConverter {
    export interface Args extends OpenAPIConverter.Args {
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
    value: HttpResponse | undefined;
    errors: ResponseErrorConverter.Output[];
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

    constructor({ context, breadcrumbs, operation, method, path }: AbstractOperationConverter.Args) {
        super({ context, breadcrumbs });
        this.operation = operation;
        this.method = method;
        this.path = path;
    }

    public abstract convert(): Promise<AbstractOperationConverter.Output | undefined>;

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

    protected async convertParameters({ breadcrumbs }: { breadcrumbs: string[] }): Promise<{
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
            const resolvedParameter = await this.context.resolveMaybeReference<OpenAPIV3_1.ParameterObject>({
                schemaOrReference: parameter,
                breadcrumbs
            });
            if (resolvedParameter == null) {
                continue;
            }

            const parameterConverter = new ParameterConverter({
                context: this.context,
                breadcrumbs,
                parameter: resolvedParameter
            });

            const convertedParameter = await parameterConverter.convert();
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
            const exampleName = `${param}_example`;
            pathParameters.push({
                name: this.context.casingsGenerator.generateName(param),
                valueType: ParameterConverter.STRING,
                docs: undefined,
                location: "ENDPOINT",
                variable: undefined,
                v2Examples: {
                    userSpecifiedExamples: {},
                    autogeneratedExamples: {
                        [exampleName]: await this.generateStringParameterExample({ example: undefined })
                    }
                }
            });
        }

        return {
            pathParameters,
            queryParameters,
            headers
        };
    }

    protected async convertRequestBody({
        breadcrumbs,
        group,
        method
    }: {
        breadcrumbs: string[];
        group: string[] | undefined;
        method: string;
    }): Promise<ConvertedRequestBody | undefined | null> {
        if (this.operation.requestBody == null) {
            return undefined;
        }

        const resolvedRequestBody = await this.context.resolveMaybeReference<OpenAPIV3_1.RequestBodyObject>({
            schemaOrReference: this.operation.requestBody,
            breadcrumbs
        });

        if (resolvedRequestBody == null) {
            return null;
        }

        const requestBodyConverter = new RequestBodyConverter({
            context: this.context,
            breadcrumbs,
            requestBody: resolvedRequestBody,
            group: group ?? [],
            method
        });
        const convertedRequestBody = await requestBodyConverter.convert();

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
        breadcrumbs,
        group,
        method,
        streamingExtension
    }: {
        breadcrumbs: string[];
        group: string[] | undefined;
        method: string;
        streamingExtension: FernStreamingExtension.Output | undefined;
    }): Promise<ConvertedResponseBody | undefined> {
        if (this.operation.responses == null) {
            return undefined;
        }

        let convertedResponseBody: ConvertedResponseBody | undefined = undefined;
        // TODO: Our existing Parser will only parse the first successful response.
        let hasSuccessfulResponse = false;

        for (const [statusCode, response] of Object.entries(this.operation.responses)) {
            const statusCodeNum = parseInt(statusCode);
            if (isNaN(statusCodeNum) || statusCodeNum < 200 || (statusCodeNum >= 300 && statusCodeNum < 400)) {
                continue;
            }
            if (convertedResponseBody == null) {
                convertedResponseBody = {
                    value: undefined,
                    errors: [],
                    examples: {}
                };
            }
            // Convert Successful Responses (2xx)
            if (statusCodeNum >= 200 && statusCodeNum < 300 && !hasSuccessfulResponse) {
                const resolvedResponse = await this.context.resolveMaybeReference<OpenAPIV3_1.ResponseObject>({
                    schemaOrReference: response,
                    breadcrumbs: [...breadcrumbs, statusCode]
                });

                if (resolvedResponse == null) {
                    continue;
                }

                const responseBodyConverter = new ResponseBodyConverter({
                    context: this.context,
                    breadcrumbs: [...breadcrumbs, statusCode],
                    responseBody: resolvedResponse,
                    group: group ?? [],
                    method,
                    statusCode,
                    streamingExtension
                });
                const converted = await responseBodyConverter.convert();
                if (converted != null) {
                    hasSuccessfulResponse = true;
                    this.inlinedTypes = {
                        ...this.inlinedTypes,
                        ...converted.inlinedTypes
                    };
                    convertedResponseBody.value = {
                        statusCode: statusCodeNum,
                        body: converted.responseBody
                    };
                }
            }
            // Convert Error Responses (4xx and 5xx)
            if (statusCodeNum >= 400 && statusCodeNum < 600) {
                const resolvedResponse = await this.context.resolveMaybeReference<OpenAPIV3_1.ResponseObject>({
                    schemaOrReference: response,
                    breadcrumbs: [...breadcrumbs, statusCode]
                });

                if (resolvedResponse == null) {
                    continue;
                }

                const responseErrorConverter = new ResponseErrorConverter({
                    context: this.context,
                    breadcrumbs: [...breadcrumbs, statusCode],
                    responseError: resolvedResponse,
                    group: group ?? [],
                    method,
                    methodName: this.evaluateMethodNameFromOperation(),
                    statusCode: statusCodeNum
                });
                const converted = await responseErrorConverter.convert();
                if (converted != null) {
                    this.inlinedTypes = {
                        ...this.inlinedTypes,
                        ...converted.inlinedTypes
                    };
                    convertedResponseBody.errors.push(converted);
                }
            }
        }

        return convertedResponseBody;
    }

    protected computeGroupNameAndLocationFromExtensions(): GroupNameAndLocation | undefined {
        const methodNameExtension = new Extensions.SdkMethodNameExtension({
            breadcrumbs: this.breadcrumbs,
            operation: this.operation,
            context: this.context
        });
        const method = methodNameExtension.convert()?.methodName;

        const groupNameExtension = new Extensions.SdkGroupNameExtension({
            breadcrumbs: this.breadcrumbs,
            operation: this.operation,
            context: this.context
        });
        const group = groupNameExtension.convert()?.groups ?? [];

        if (method != null) {
            return { group, method };
        }

        return undefined;
    }

    protected evaluateMethodNameFromOperation(): string {
        const operationId = this.operation.operationId;
        if (operationId == null) {
            return this.operation.summary != null
                ? camelCase(this.operation.summary)
                : camelCase(`${this.method}_${this.path.split("/").join("_")}`);
        }
        return operationId;
    }

    protected computeGroupNameFromTagAndOperationId(): GroupNameAndLocation {
        const tag = this.operation.tags?.[0];
        const methodName = this.evaluateMethodNameFromOperation();

        if (tag == null) {
            return { method: methodName };
        }

        const tagTokens = tokenizeString(tag);
        const methodNameTokens = tokenizeString(methodName);

        if (isEqual(tagTokens, methodNameTokens)) {
            return {
                method: tag
            };
        }
        return this.computeGroupAndMethodFromTokens({
            tag,
            tagTokens,
            methodName,
            methodNameTokens
        });
    }

    protected computeGroupAndMethodFromTokens({
        tag,
        tagTokens,
        methodName,
        methodNameTokens
    }: {
        tag: string;
        tagTokens: string[];
        methodName: string;
        methodNameTokens: string[];
    }): GroupNameAndLocation {
        const tagIsNotPrefixOfMethodName = tagTokens.some((tagToken, index) => tagToken !== methodNameTokens[index]);

        if (tagIsNotPrefixOfMethodName) {
            return {
                group: [tag],
                method: methodName
            };
        }

        const methodTokens = methodNameTokens.slice(tagTokens.length);
        return {
            group: [tag],
            method: camelCase(methodTokens.join("_"))
        };
    }

    private async generateStringParameterExample({ example }: { example: unknown }): Promise<unknown> {
        const exampleConverter = new Converters.ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema: { type: "string" },
            example
        });
        const { validExample } = await exampleConverter.convert();
        return validExample;
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
