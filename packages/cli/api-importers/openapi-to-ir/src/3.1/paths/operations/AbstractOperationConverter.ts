import { RawSchemas } from "@fern-api/fern-definition-schema";
import { HttpHeader, HttpMethod, HttpRequestBody, PathParameter, QueryParameter } from "@fern-api/ir-sdk";
import { AbstractConverter, Converters, Extensions } from "@fern-api/v3-importer-commons";
import { camelCase, compact, isEqual } from "lodash-es";
import { OpenAPIV3_1 } from "openapi-types";

import { FernStreamingExtension } from "../../../extensions/x-fern-streaming";
import { GroupNameAndLocation } from "../../../types/GroupNameAndLocation";
import { OpenAPIConverterContext3_1 } from "../../OpenAPIConverterContext3_1";
import { ParameterConverter } from "../ParameterConverter";
import { RequestBodyConverter } from "../RequestBodyConverter";

const PATH_PARAM_REGEX = /{([^}]+)}/g;

const HEADERS_TO_SKIP = new Set([
    "user-agent",
    "content-length",
    "content-type",
    "x-forwarded-for",
    "cookie",
    "origin",
    "content-disposition",
    "x-ping-custom-domain"
]);

export declare namespace AbstractOperationConverter {
    export interface Args extends AbstractConverter.Args<OpenAPIConverterContext3_1> {
        operation: OpenAPIV3_1.OperationObject;
        method: OpenAPIV3_1.HttpMethods;
        path: string;
    }

    export interface Output {
        group?: string[];
        groupDisplayName?: string;
        inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema>;
    }
}
interface ConvertedRequestBody {
    requestBody: HttpRequestBody;
    streamRequestBody: HttpRequestBody | undefined;
    examples?: Record<string, OpenAPIV3_1.ExampleObject>;
}

export abstract class AbstractOperationConverter extends AbstractConverter<
    OpenAPIConverterContext3_1,
    AbstractOperationConverter.Output
> {
    protected readonly operation: OpenAPIV3_1.OperationObject;
    protected readonly method: OpenAPIV3_1.HttpMethods;
    protected readonly path: string;
    protected inlinedTypes: Record<string, Converters.SchemaConverters.SchemaConverter.ConvertedSchema> = {};

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
            case "head":
                return HttpMethod.Head;
            default:
                return undefined;
        }
    }

    protected convertParameters({ breadcrumbs }: { breadcrumbs: string[] }): {
        pathParameters: PathParameter[];
        queryParameters: QueryParameter[];
        headers: HttpHeader[];
    } {
        const pathParameters: PathParameter[] = [];
        const queryParameters: QueryParameter[] = [];
        const headers: HttpHeader[] = [];

        if (!this.operation.parameters) {
            this.checkMissingPathParameters(pathParameters);
            return { pathParameters, queryParameters, headers };
        }

        for (const parameter of this.operation.parameters) {
            const resolvedParameter = this.context.resolveMaybeReference<OpenAPIV3_1.ParameterObject>({
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

            const convertedParameter = parameterConverter.convert();
            if (convertedParameter != null) {
                this.inlinedTypes = { ...this.inlinedTypes, ...convertedParameter.inlinedTypes };
                switch (convertedParameter.type) {
                    case "path":
                        pathParameters.push(convertedParameter.parameter);
                        break;
                    case "query":
                        queryParameters.push(convertedParameter.parameter);
                        break;
                    case "header": {
                        const headerName = convertedParameter.parameter.name.name.originalName;
                        const headerWireValue = convertedParameter.parameter.name.wireValue;

                        let duplicateHeader = false;
                        const authSchemes = this.context.authOverrides?.["auth-schemes"];
                        if (authSchemes != null) {
                            for (const authScheme of Object.values(authSchemes)) {
                                if (
                                    isHeaderAuthScheme(authScheme) &&
                                    authScheme.header.toLowerCase() === headerWireValue.toLowerCase()
                                ) {
                                    duplicateHeader = true;
                                    break;
                                }
                            }
                        }

                        const globalHeaderNames = this.context.globalHeaderNames;
                        if (globalHeaderNames != null) {
                            for (const globalHeaderName of globalHeaderNames) {
                                if (globalHeaderName.toLowerCase() === headerWireValue.toLowerCase()) {
                                    duplicateHeader = true;
                                    break;
                                }
                            }
                        }

                        if (!HEADERS_TO_SKIP.has(headerName.toLowerCase()) && !duplicateHeader) {
                            headers.push(convertedParameter.parameter);
                        }
                        break;
                    }
                }
            }
        }

        this.checkMissingPathParameters(pathParameters);
        return { pathParameters, queryParameters, headers };
    }

    protected checkMissingPathParameters(pathParameters: PathParameter[]): void {
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
                valueType: AbstractConverter.STRING,
                docs: undefined,
                location: "ENDPOINT",
                variable: undefined,
                v2Examples: {
                    userSpecifiedExamples: {},
                    autogeneratedExamples: {
                        [exampleName]: this.generateStringParameterExample({ example: param })
                    }
                }
            });
        }
    }

    protected convertRequestBody({
        breadcrumbs,
        group,
        method,
        streamingExtension
    }: {
        breadcrumbs: string[];
        group: string[] | undefined;
        method: string;
        streamingExtension: FernStreamingExtension.Output | undefined;
    }): ConvertedRequestBody[] | undefined | null {
        if (this.operation.requestBody == null) {
            return undefined;
        }

        const resolvedRequestBody = this.context.resolveMaybeReference<OpenAPIV3_1.RequestBodyObject>({
            schemaOrReference: this.operation.requestBody,
            breadcrumbs
        });

        if (resolvedRequestBody == null) {
            return null;
        }

        const convertedRequestBodies: ConvertedRequestBody[] = [];

        for (const [contentType, mediaType] of Object.entries(resolvedRequestBody.content)) {
            const requestBodyConverter = new RequestBodyConverter({
                context: this.context,
                breadcrumbs,
                contentType,
                mediaType,
                description: resolvedRequestBody.description,
                required: resolvedRequestBody.required,
                group: group ?? [],
                method,
                streamingExtension
            });
            const convertedRequestBody = requestBodyConverter.convert();
            if (convertedRequestBody != null) {
                this.inlinedTypes = {
                    ...this.inlinedTypes,
                    ...convertedRequestBody.inlinedTypes
                };
                convertedRequestBodies.push({
                    requestBody: convertedRequestBody.requestBody,
                    streamRequestBody: convertedRequestBody.streamRequestBody,
                    examples: convertedRequestBody.examples
                });
            }
        }

        return convertedRequestBodies;
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

    private generateStringParameterExample({ example }: { example: unknown }): unknown {
        const exampleConverter = new Converters.ExampleConverter({
            breadcrumbs: this.breadcrumbs,
            context: this.context,
            schema: { type: "string" },
            example
        });
        const { validExample } = exampleConverter.convert();
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

function isHeaderAuthScheme(
    scheme: RawSchemas.AuthSchemeDeclarationSchema
): scheme is RawSchemas.HeaderAuthSchemeSchema {
    return (scheme as RawSchemas.HeaderAuthSchemeSchema)?.header != null;
}
