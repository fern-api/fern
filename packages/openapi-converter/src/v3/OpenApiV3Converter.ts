import { Logger } from "@fern-api/logger";
import { HttpHeaderSchema } from "@fern-api/yaml-schema/src/schemas";
import { OpenAPIV3 } from "openapi-types";
import { ConvertedFernDefinition } from "../openApiConverterV2";
import { ConvertedHeader, getHttpHeaderSchema } from "./convertedTypes/convertedHeader";
import { convertSchemaToFernPrimitiveType } from "./convertSchemaToFernPrimitive";
import { OpenApiV3Context } from "./OpenApiV3Context";

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
        return {
            rootApiFile: {
                name: "",
            },
            serviceFiles: {},
        };
    }

    private getGlobalHeaders(): HttpHeaderSchema[] {
        let headersAdded = false;
        const globalHeaders: Record<string, HttpHeaderSchema> = {};
        for (const [path, pathDefinition] of Object.entries(this.openApiV3.paths)) {
            if (pathDefinition == null) {
                continue;
            }
            for (const httpMethod of Object.values(OpenAPIV3.HttpMethods)) {
                const httpMethodDefinition = pathDefinition[httpMethod];
                if (httpMethodDefinition == null) {
                    continue;
                }
                if (httpMethodDefinition.parameters == null) {
                    return [];
                }
                const headers = this.getheadersFromMethodParameters(httpMethodDefinition.parameters);
                for (const header of headers) {
                    if (!headersAdded) {
                        globalHeaders[header.wireKey] = getHttpHeaderSchema(header);
                    } else if (!(header.wireKey in globalHeaders)) {
                        delete globalHeaders[header.wireKey];
                    }
                }
                headersAdded = true;
            }
        }
        return [];
    }

    private getheadersFromMethodParameters(
        parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
    ): ConvertedHeader[] {
        const convertedHeaders: ConvertedHeader[] = [];
        for (const parameter of parameters) {
            const parameterObject = this.context.getParameter(parameter);
            if (parameterObject == null) {
                continue;
            }
            const convertedHeader = this.convertParameterToHeader(parameterObject);
            if (convertedHeader != null) {
                convertedHeaders.push(convertedHeader);
            }
        }
        return convertedHeaders;
    }

    private convertParameterToHeader(parameter: OpenAPIV3.ParameterObject): ConvertedHeader | undefined {
        if (parameter.in !== "header") {
            return undefined;
        }
        if (parameter.schema == null) {
            this.logger.error(`Header ${parameter.name} has undefined schema.`);
            return undefined;
        }
        const parameterSchema = this.context.getSchema(parameter.schema);
        if (parameterSchema == null) {
            return undefined;
        }
        const primitiveParameterSchema = convertSchemaToFernPrimitiveType(parameterSchema);
        if (primitiveParameterSchema == null) {
            this.logger.error(
                `Header ${parameter.name} has invalid schema: ${JSON.stringify(parameter.schema, undefined, 2)}`
            );
            return undefined;
        }

        return {
            wireKey: parameter.name,
            docs: parameter.description,
            type:
                parameter.required != null && parameter.required
                    ? primitiveParameterSchema
                    : `optional<${primitiveParameterSchema}>`,
        };
    }
}
