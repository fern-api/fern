import { TaskContext } from "@fern-api/task-context";
import { isRawAliasDefinition, isRawEnumDefinition, isRawObjectDefinition, RawSchemas } from "@fern-api/yaml-schema";
import { size } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { InlinedTypeNamer } from "./InlinedTypeNamer";
import { OpenApiV3Context, OpenAPIV3Endpoint } from "./OpenApiV3Context";
import { ServiceBasePath } from "./OpenApiV3Converter";
import { SchemaConverter } from "./SchemaConverter";
import {
    APPLICATION_JSON_CONTENT,
    diff,
    getFernReferenceForSchema,
    isListOfPrimitive,
    isPrimitive,
    isReferenceObject,
    maybeGetAliasReference,
    REQUEST_REFERENCE_PREFIX,
    RESPONSE_REFERENCE_PREFIX,
} from "./utils";

export interface ConvertedEndpoint {
    endpoint: RawSchemas.HttpEndpointSchema;
    additionalTypeDeclarations?: Record<string, RawSchemas.TypeDeclarationSchema>;
    imports: Record<string, string>;
}

const TWO_HUNDRED_STATUS_CODE = 200;

export class EndpointConverter {
    private endpoint: OpenAPIV3Endpoint;
    private context: OpenApiV3Context;
    private resolvedParameters: OpenAPIV3.ParameterObject[] = [];
    private globalHeaders: Set<string> = new Set();
    private taskContext: TaskContext;
    private inlinedTypeNamer: InlinedTypeNamer;
    private breadcrumbs: string[];
    private tag: string;
    private imports: Record<string, string> = {};
    private serviceBasePath: ServiceBasePath;
    private additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};

    constructor(
        endpoint: OpenAPIV3Endpoint,
        context: OpenApiV3Context,
        taskContext: TaskContext,
        inlinedTypeNamer: InlinedTypeNamer,
        breadcrumbs: string[],
        tag: string,
        serviceBasePath: ServiceBasePath
    ) {
        this.endpoint = endpoint;
        this.context = context;
        this.taskContext = taskContext;
        this.inlinedTypeNamer = inlinedTypeNamer;
        this.breadcrumbs = [...breadcrumbs, endpoint.path, endpoint.httpMethod];
        this.tag = tag;
        this.serviceBasePath = serviceBasePath;
        (this.endpoint.definition.parameters ?? []).forEach((parameter) => {
            const resolvedParameter = isReferenceObject(parameter)
                ? this.context.maybeResolveParameterReference(parameter)
                : parameter;
            if (resolvedParameter != null) {
                this.resolvedParameters.push(resolvedParameter);
            }
        });
    }

    public convert(): ConvertedEndpoint | undefined {
        const convertedHttpMethod = convertHttpMethod(this.endpoint.httpMethod);
        if (convertedHttpMethod == null) {
            return undefined;
        }

        const endpointPathParts = this.endpoint.path.split("/").slice(this.serviceBasePath.parts.length);
        const endpointPathParameters = [];
        for (const part of endpointPathParts) {
            if (part.startsWith("{") && part.endsWith("}")) {
                endpointPathParameters.push(part.substring(1, part.length - 1));
            }
        }
        const endpointPath = endpointPathParts.join("/");

        const pathParameters = this.getPathParameters(endpointPathParameters);
        const queryParameters = this.getQueryParameters();
        const headerParameters = this.getHeaderParameters();
        const requestBody =
            this.endpoint.definition.requestBody != null
                ? this.convertRequestBody(this.endpoint.definition.requestBody)
                : undefined;

        const successResponse =
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            this.endpoint.definition.responses != null
                ? this.endpoint.definition.responses[TWO_HUNDRED_STATUS_CODE]
                : undefined;
        const responseBody = successResponse != null ? this.convertResponseBody(successResponse) : undefined;
        this.additionalTypeDeclarations = {
            ...this.additionalTypeDeclarations,
            ...requestBody?.additionalTypes,
            ...responseBody?.additionalTypes,
        };

        const endpoint: RawSchemas.HttpEndpointSchema = {
            path: endpointPath.startsWith("/") || endpointPath.length === 0 ? endpointPath : `/${endpointPath}`,
            method: convertedHttpMethod,
            docs: this.endpoint.definition.description,
            "display-name": this.endpoint.definition.summary,
        };

        if (size(pathParameters) > 0) {
            endpoint["path-parameters"] = pathParameters;
        }

        let request: RawSchemas.HttpRequestSchema | undefined;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requestName = (this.endpoint.definition as any)["x-request-name"] as string | undefined;
        if (requestName != null) {
            if (request == null) {
                request = {};
            }
            request.name = requestName;
        }

        if (size(queryParameters) > 0) {
            if (request == null) {
                request = {};
            }
            request["query-parameters"] = queryParameters;
        }

        if (size(headerParameters) > 0) {
            if (request == null) {
                request = {};
            }
            request.headers = headerParameters;
        }

        if (requestBody != null) {
            if (request == null) {
                request = {};
            }
            request.body = requestBody.value;
        }

        if (request != null) {
            endpoint.request = request;
        }

        if (responseBody != null) {
            endpoint.response = responseBody.response;
        }

        return {
            endpoint,
            additionalTypeDeclarations: this.additionalTypeDeclarations,
            imports: this.imports,
        };
    }

    private getPathParameters(endpointPathParameters: string[]): Record<string, RawSchemas.HttpPathParameterSchema> {
        const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
        for (const parameter of this.resolvedParameters) {
            if (parameter.in === "path") {
                if (this.serviceBasePath.pathParameters.includes(parameter.name)) {
                    continue;
                }

                const parameterType = this.convertHeaderOrPathParameter(parameter);
                if (parameterType == null) {
                    continue;
                }

                const schema =
                    parameter.description != null
                        ? {
                              docs: parameter.description,
                              type: parameterType,
                          }
                        : parameterType;
                pathParameters[parameter.name] = schema;
            }
        }
        const excludedPathParameters = diff(endpointPathParameters, Object.keys(pathParameters));
        excludedPathParameters.forEach((pathParameter) => {
            pathParameters[pathParameter] = "string";
        });
        return pathParameters;
    }

    private getQueryParameters(): Record<string, RawSchemas.HttpQueryParameterSchema> {
        const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
        for (const parameter of this.resolvedParameters) {
            if (parameter.in === "query") {
                const parameterType = this.convertQueryParameter(parameter);
                if (parameterType == null) {
                    continue;
                }
                const schema =
                    parameter.description != null
                        ? {
                              docs: parameter.description,
                              ...(typeof parameterType === "string" ? { type: parameterType } : parameterType),
                          }
                        : parameterType;
                queryParameters[parameter.name] = schema;
            }
        }
        return queryParameters;
    }

    private getHeaderParameters(): Record<string, RawSchemas.HttpHeaderSchema> {
        const headerParameters: Record<string, RawSchemas.HttpHeaderSchema> = {};
        for (const parameter of this.resolvedParameters) {
            if (parameter.in === "header") {
                if (this.globalHeaders.has(parameter.name)) {
                    continue;
                } else if (parameter.name.toLowerCase() === "authorization") {
                    // Authorization header will already be configured based on security schemes
                    continue;
                }
                const parameterType = this.convertHeaderOrPathParameter(parameter);
                if (parameterType == null) {
                    continue;
                }
                const schema =
                    parameter.description != null
                        ? {
                              docs: parameter.description,
                              type: parameterType,
                          }
                        : parameterType;
                headerParameters[parameter.name] = schema;
            }
        }
        return headerParameters;
    }

    private convertQueryParameter(
        parameter: OpenAPIV3.ParameterObject
    ): RawSchemas.HttpQueryParameterSchema | undefined {
        const required = parameter.required ?? false;
        if (parameter.schema == null) {
            return required ? "string" : "optional<string>";
        }

        const resolvedParameterSchema = isReferenceObject(parameter.schema)
            ? this.context.maybeResolveReference(parameter.schema)?.schemaObject
            : parameter.schema;

        if (resolvedParameterSchema == null) {
            return required ? "string" : "optional<string>";
        }

        const schemaConverter = new SchemaConverter({
            schema: resolvedParameterSchema,
            taskContext: this.taskContext,
            inlinedTypeNamer: this.inlinedTypeNamer,
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            tag: this.tag,
        });
        const convertedSchema = schemaConverter.convert();

        if (convertedSchema != null && isRawEnumDefinition(convertedSchema.typeDeclaration)) {
            if (isReferenceObject(parameter.schema)) {
                const ref = getFernReferenceForSchema(parameter.schema, this.context, this.tag, this.imports);
                return required ? ref : `optional<${ref}>`;
            }
            const inlinedName = this.inlinedTypeNamer.getName();
            this.additionalTypeDeclarations = {
                ...this.additionalTypeDeclarations,
                [this.inlinedTypeNamer.getName()]: convertedSchema.typeDeclaration,
            };
            return required ? inlinedName : `optional<${inlinedName}>`;
        } else if (
            convertedSchema != null &&
            isRawAliasDefinition(convertedSchema.typeDeclaration) &&
            isPrimitive(convertedSchema.typeDeclaration)
        ) {
            const boxedType =
                typeof convertedSchema.typeDeclaration === "string"
                    ? convertedSchema.typeDeclaration
                    : convertedSchema.typeDeclaration.type;
            return required ? boxedType : `optional<${boxedType}>`;
        } else if (
            parameter.in === "query" &&
            convertedSchema != null &&
            isRawAliasDefinition(convertedSchema.typeDeclaration) &&
            isListOfPrimitive(convertedSchema.typeDeclaration) != null
        ) {
            const boxedType = isListOfPrimitive(convertedSchema.typeDeclaration);
            if (boxedType == null) {
                return undefined;
            }
            const stringifiedBoxedType = typeof boxedType === "string" ? boxedType : boxedType.type;
            return {
                type: required ? stringifiedBoxedType : `optional<${stringifiedBoxedType}>`,
                "allow-multiple": true,
            };
        } else if (convertedSchema != null) {
            this.taskContext.logger.warn(
                `${this.breadcrumbs.join(" -> ")} -> ${
                    parameter.in
                }: skipping parameter with non-primitive schema ${JSON.stringify(resolvedParameterSchema)}`
            );
        }
        return undefined;
    }

    private convertHeaderOrPathParameter(parameter: OpenAPIV3.ParameterObject): string | undefined {
        const required = parameter.required ?? false;
        if (parameter.schema == null) {
            return required ? "string" : "optional<string>";
        }

        const resolvedParameterSchema = isReferenceObject(parameter.schema)
            ? this.context.maybeResolveReference(parameter.schema)?.schemaObject
            : parameter.schema;

        if (resolvedParameterSchema == null) {
            return required ? "string" : "optional<string>";
        }

        const schemaConverter = new SchemaConverter({
            schema: resolvedParameterSchema,
            taskContext: this.taskContext,
            inlinedTypeNamer: this.inlinedTypeNamer,
            context: this.context,
            breadcrumbs: this.breadcrumbs,
            tag: this.tag,
        });
        const convertedSchema = schemaConverter.convert();

        if (convertedSchema != null && isRawEnumDefinition(convertedSchema.typeDeclaration)) {
            if (isReferenceObject(parameter.schema)) {
                const ref = getFernReferenceForSchema(parameter.schema, this.context, this.tag, this.imports);
                return required ? ref : `optional<${ref}>`;
            }
            const inlinedName = this.inlinedTypeNamer.getName();
            this.additionalTypeDeclarations = {
                ...this.additionalTypeDeclarations,
                [this.inlinedTypeNamer.getName()]: convertedSchema.typeDeclaration,
            };
            return required ? inlinedName : `optional<${inlinedName}>`;
        } else if (
            convertedSchema != null &&
            isRawAliasDefinition(convertedSchema.typeDeclaration) &&
            isPrimitive(convertedSchema.typeDeclaration)
        ) {
            const boxedType =
                typeof convertedSchema.typeDeclaration === "string"
                    ? convertedSchema.typeDeclaration
                    : convertedSchema.typeDeclaration.type;
            return required ? boxedType : `optional<${boxedType}>`;
        } else if (convertedSchema != null) {
            this.taskContext.logger.warn(
                `${this.breadcrumbs.join(" -> ")} -> ${
                    parameter.in
                }: parameter had non-primitive schema: ${JSON.stringify(resolvedParameterSchema)}`
            );
        }
        return undefined;
    }

    private convertRequestBody(
        requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
    ): ReferencedRequest | InlinedRequest | undefined {
        if (isReferenceObject(requestBody)) {
            return {
                type: "referenced",
                value: getFernReferenceForRequest(requestBody, this.context, this.tag, this.imports),
            };
        }

        const requestBodySchema = requestBody.content[APPLICATION_JSON_CONTENT]?.schema;
        if (requestBodySchema == null) {
            return undefined;
        }
        if (isReferenceObject(requestBodySchema)) {
            return {
                type: "referenced",
                value: getFernReferenceForSchema(requestBodySchema, this.context, this.tag, this.imports),
            };
        }

        const breadcrumbs = [...this.breadcrumbs, "requestBody"];
        const schemaConverter = new SchemaConverter({
            schema: requestBodySchema,
            taskContext: this.taskContext,
            inlinedTypeNamer: this.inlinedTypeNamer,
            context: this.context,
            breadcrumbs,
            tag: this.tag,
        });
        const convertedSchema = schemaConverter.convert();

        if (convertedSchema == null) {
            this.taskContext.logger.warn(`${breadcrumbs.join(" > ")}: Failed to convert request body`);
            return undefined;
        }

        if (isRawObjectDefinition(convertedSchema.typeDeclaration)) {
            return {
                type: "inlined",
                value: convertedSchema.typeDeclaration,
                additionalTypes: convertedSchema.additionalTypeDeclarations,
            };
        }

        const requestTypeName = this.inlinedTypeNamer.getName();
        return {
            type: "referenced",
            value: requestTypeName,
            additionalTypes: {
                ...convertedSchema.additionalTypeDeclarations,
                [requestTypeName]: convertedSchema.typeDeclaration,
            },
        };
    }

    private convertResponseBody(
        responseBody: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject
    ): ConvertedResponse | undefined {
        if (isReferenceObject(responseBody)) {
            return {
                response: getFernReferenceForResponse(responseBody, this.context, this.tag, this.imports),
            };
        }

        if (responseBody.content == null) {
            return undefined;
        }

        const responseBodySchema = responseBody.content[APPLICATION_JSON_CONTENT]?.schema;
        if (responseBodySchema == null) {
            return undefined;
        }
        if (isReferenceObject(responseBodySchema)) {
            return {
                response: getFernReferenceForSchema(responseBodySchema, this.context, this.tag, this.imports),
            };
        }

        const breadcrumbs = [...this.breadcrumbs, "responseBody"];
        const schemaConverter = new SchemaConverter({
            schema: responseBodySchema,
            taskContext: this.taskContext,
            inlinedTypeNamer: this.inlinedTypeNamer,
            context: this.context,
            breadcrumbs,
            tag: this.tag,
        });
        const convertedSchema = schemaConverter.convert();

        if (convertedSchema == null) {
            this.taskContext.logger.warn(`${breadcrumbs.join(" > ")}: Failed to convert response body`);
            return undefined;
        }

        const maybeAliasType = maybeGetAliasReference(convertedSchema.typeDeclaration);
        if (maybeAliasType != null) {
            return {
                response: maybeAliasType,
                additionalTypes: {
                    ...convertedSchema.additionalTypeDeclarations,
                },
            };
        } else {
            const responseTypeName = this.inlinedTypeNamer.getName();
            return {
                response: responseTypeName,
                additionalTypes: {
                    ...convertedSchema.additionalTypeDeclarations,
                    [responseTypeName]: convertedSchema.typeDeclaration,
                },
            };
        }
    }
}

interface ReferencedRequest {
    type: "referenced";
    value: string | RawSchemas.HttpReferencedRequestBodySchema;
    additionalTypes?: Record<string, RawSchemas.TypeDeclarationSchema>;
}

interface InlinedRequest {
    type: "inlined";
    value: RawSchemas.HttpInlineRequestBodySchema;
    additionalTypes?: Record<string, RawSchemas.TypeDeclarationSchema>;
}

interface ConvertedResponse {
    response: string;
    additionalTypes?: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function isObjectSchema(parameter: RawSchemas.TypeDeclarationSchema): parameter is RawSchemas.ObjectSchema {
    return (parameter as RawSchemas.ObjectSchema).properties != null;
}

function getFernReferenceForRequest(
    requestReference: OpenAPIV3.ReferenceObject,
    context: OpenApiV3Context,
    tag: string,
    imports: Record<string, string>
): string {
    return getFernReferenceForSchema(requestReference, context, tag, imports, REQUEST_REFERENCE_PREFIX);
}

function getFernReferenceForResponse(
    responseReference: OpenAPIV3.ReferenceObject,
    context: OpenApiV3Context,
    tag: string,
    imports: Record<string, string>
): string {
    return getFernReferenceForSchema(responseReference, context, tag, imports, RESPONSE_REFERENCE_PREFIX);
}

function convertHttpMethod(httpMethod: OpenAPIV3.HttpMethods): RawSchemas.HttpMethodSchema | undefined {
    switch (httpMethod) {
        case OpenAPIV3.HttpMethods.GET:
            return "GET";
        case OpenAPIV3.HttpMethods.POST:
            return "POST";
        case OpenAPIV3.HttpMethods.PUT:
            return "PUT";
        case OpenAPIV3.HttpMethods.PATCH:
            return "PATCH";
        case OpenAPIV3.HttpMethods.DELETE:
            return "DELETE";
        default:
            return undefined;
    }
}
