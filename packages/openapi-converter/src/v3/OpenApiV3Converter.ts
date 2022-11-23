import { Logger } from "@fern-api/logger";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { ConvertedFernDefinition } from "../openApiConverterV2";
import { ConvertedEndpoint } from "./convertedTypes/convertedEndpoint";
import { ConvertedHeader, getHttpHeaderSchema } from "./convertedTypes/convertedHeader";
import { ConvertedPathParam } from "./convertedTypes/convertedPathParam";
import { ConvertedQueryParam } from "./convertedTypes/convertedQueryParam";
import { convertSchemaToFernPrimitiveType } from "./convertSchemaToFernPrimitive";
import { EndpointDefinition, OpenApiV3Context } from "./OpenApiV3Context";
import { ServiceBuilder } from "./ServiceBuilder";

export class OpenApiV3Converter {
    private openApiV3: OpenAPIV3.Document;
    private logger: Logger;
    private context: OpenApiV3Context;

    constructor({ openApiV3, logger }: { openApiV3: OpenAPIV3.Document; logger: Logger }) {
        this.openApiV3 = openApiV3;
        this.logger = logger;
        this.context = new OpenApiV3Context({
            openApiV3,
            logger,
        });
    }

    public async convert(): Promise<ConvertedFernDefinition> {
        const globalHeaders = this.getGlobalHeaders();
        return {
            rootApiFile: {
                name: "api",
                headers: globalHeaders,
            },
            serviceFiles: {},
        };
    }

    private getServices({
        globalHeaders,
    }: {
        globalHeaders: Record<string, RawSchemas.HttpHeaderSchema>;
    }): Record<string, string> {
        if (this.openApiV3.tags == null) {
            this.logger.error("No tags present. Skipping creating services.");
            return {};
        }

        const serviceBuilders: Record<string, ServiceBuilder> = {};
        this.openApiV3.tags.forEach((tag) => {
            serviceBuilders[tag.name] = new ServiceBuilder({ tag });
        });

        for (const endpoint of this.context.getEndpoints()) {
            if (endpoint.definition.tags == null || endpoint.definition.tags.length === 0) {
                this.logger.error(`${endpoint.httpMethod.toUpperCase()} ${endpoint.path} is missing tag. Skipping.`);
                continue;
            }
            if (endpoint.definition.operationId == null) {
                this.logger.error(
                    `${endpoint.httpMethod.toUpperCase()} ${endpoint.path} is missing operationId. Skipping.`
                );
                continue;
            }

            if (endpoint.definition.tags.length > 0) {
                this.logger.info(
                    `${endpoint.httpMethod.toUpperCase()} ${endpoint.path} has multiple tags. Using ${
                        endpoint.definition.tags[0]
                    }`
                );
            }
            const endpointTag = endpoint.definition.tags[0];
            const operationId = endpoint.definition.operationId;
        }
        return;
    }

    private getConvertedEndpoint({
        endpiont,
        globalHeaders,
    }: {
        endpoint: EndpointDefinition;
        globalHeaders: Record<string, RawSchemas.HttpHeaderSchema>;
    }): void {
        endpoint.definition.parameters?.map((parameter) => {
            const parameterObject = this.context.getParameter(parameter);
            if (parameterObject == null) {
                return undefined;
            }
            return this.convertParameter(parameterObject);
        });

        const convertedEndpoint: ConvertedEndpoint = {
            path: endpoint.path,
            method: endpoint.httpMethod,
            headers: [],
        };
    }

    private getGlobalHeaders(): Record<string, RawSchemas.HttpHeaderSchema> {
        let headersAdded = false;
        const globalHeaders = new Map<string, RawSchemas.HttpHeaderSchema>();
        for (const endpoint of this.context.getEndpoints()) {
            if (endpoint.definition.parameters == null) {
                return {};
            }
            const headers = this.getheadersFromMethodParameters(endpoint.definition.parameters);
            if (!headersAdded) {
                Object.values(headers).forEach((convertedHeader) => {
                    globalHeaders.set(convertedHeader.wireKey, getHttpHeaderSchema(convertedHeader));
                });
            } else {
                for (const globalHeaderKey of Object.keys(globalHeaders)) {
                    if (!(globalHeaderKey in headers)) {
                        globalHeaders.delete(globalHeaderKey);
                    }
                }
            }
            headersAdded = true;
        }
        const result: Record<string, RawSchemas.HttpHeaderSchema> = {};
        for (const [globalHeaderKey, globalHeader] of globalHeaders.entries()) {
            result[globalHeaderKey] = globalHeader;
        }
        return result;
    }

    private getheadersFromMethodParameters(
        parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
    ): Record<string, ConvertedHeader> {
        const convertedHeaders: Record<string, ConvertedHeader> = {};
        for (const parameter of parameters) {
            const parameterObject = this.context.getParameter(parameter);
            if (parameterObject == null) {
                continue;
            }
            const convertedHeader = this.convertParameterToHeader(parameterObject);
            if (convertedHeader != null) {
                convertedHeaders[convertedHeader.wireKey] = convertedHeader;
            }
        }
        return convertedHeaders;
    }

    private convertParameter(
        parameter: OpenAPIV3.ParameterObject
    ): ConvertedHeader | ConvertedQueryParam | ConvertedPathParam | undefined {
        if (parameter.in === "header") {
            return this.convertParameterToHeader(parameter);
        } else if (parameter.in === "query") {
            return this.convertParameterToQuery(parameter);
        } else if (parameter.in === "path") {
            return this.convertParameterToPath(parameter);
        }
        this.logger.error(`Unsupported endpoint parameter ${parameter.name} has type ${parameter.in}`);
        return undefined;
    }

    private convertParameterToHeader(parameter: OpenAPIV3.ParameterObject): ConvertedHeader | undefined {
        if (parameter.in !== "header") {
            return undefined;
        }

        const paramType = this.getParamType({
            parameter,
            paramType: "header",
        });
        if (paramType == null) {
            return undefined;
        }

        return {
            paramType: "header",
            wireKey: parameter.name,
            docs: parameter.description,
            type: paramType,
        };
    }

    private convertParameterToQuery(parameter: OpenAPIV3.ParameterObject): ConvertedQueryParam | undefined {
        if (parameter.in !== "query") {
            return undefined;
        }

        const paramType = this.getParamType({
            parameter,
            paramType: "query",
        });
        if (paramType == null) {
            return undefined;
        }

        return {
            paramType: "query",
            paramName: parameter.name,
            docs: parameter.description,
            type: paramType,
        };
    }

    private convertParameterToPath(parameter: OpenAPIV3.ParameterObject): ConvertedPathParam | undefined {
        if (parameter.in !== "path") {
            return undefined;
        }

        const paramType = this.getParamType({
            parameter,
            paramType: "path",
        });
        if (paramType == null) {
            return undefined;
        }

        return {
            paramType: "path",
            paramName: parameter.name,
            docs: parameter.description,
            type: paramType,
        };
    }

    private getParamType({
        parameter,
        paramType,
    }: {
        parameter: OpenAPIV3.ParameterObject;
        paramType: "header" | "query" | "path";
    }): string | undefined {
        if (parameter.schema == null) {
            this.logger.error(`${this.getBeautifiedParameterName(paramType)} ${parameter.name} has undefined schema.`);
            return undefined;
        }
        const parameterSchema = this.context.getSchema(parameter.schema);
        if (parameterSchema == null) {
            return undefined;
        }
        const primitiveParameterSchema = convertSchemaToFernPrimitiveType(parameterSchema);
        if (primitiveParameterSchema == null) {
            this.logger.error(
                `${this.getBeautifiedParameterName(paramType)} ${parameter.name} has invalid schema: ${JSON.stringify(
                    parameter.schema,
                    undefined,
                    2
                )}`
            );
            return undefined;
        }
        return parameter.required != null && parameter.required
            ? primitiveParameterSchema
            : `optional<${primitiveParameterSchema}>`;
    }

    private getBeautifiedParameterName(paramType: "header" | "query" | "path"): string {
        if (paramType === "header") {
            return "Header";
        } else if (paramType === "path") {
            return "Path parameter";
        } else {
            return "Query parameter";
        }
    }
}
