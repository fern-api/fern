import SwaggerParser from "@apidevtools/swagger-parser";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";
import { HttpHeaderSchema } from "@fern-api/yaml-schema/src/schemas";
import { OpenAPI, OpenAPIV3 } from "openapi-types";

export interface ConvertedFernDefinition {
    rootApiFile: RootApiFileSchema;
    serviceFiles: Record<RelativeFilePath, ServiceFileSchema>;
}

declare namespace OpenApiConverter {
    interface Args {
        openApiFilePath: string;
        logger: Logger;
    }
}

export class OpenApiConverter {
    private openApiFilePath: string;
    private logger: Logger;

    constructor(args: OpenApiConverter.Args) {
        this.openApiFilePath = args.openApiFilePath;
        this.logger = args.logger;
    }

    public async convert(): Promise<ConvertedFernDefinition> {
        this.logger.debug(`Reading Open API from ${this.openApiFilePath}`);
        const openApiDocument = await SwaggerParser.parse(this.openApiFilePath);
        if (isOpenApiV3(openApiDocument)) {
            const openApiV3Converter = new OpenApiV3Converter({
                openApiV3: openApiDocument,
                logger: this.logger,
            });
            return openApiV3Converter.convert();
        } else {
            throw new Error("Open API converter only handles V3 specs. Received v2.");
        }
    }
}

class OpenApiV3Converter {
    private static PARAMETER_REFERENCE_PREFIX = "#/components/parameters/";

    private openApi: OpenAPIV3.Document;
    private logger: Logger;

    constructor({ openApiV3, logger }: { openApiV3: OpenAPIV3.Document; logger: Logger }) {
        this.openApi = openApiV3;
        this.logger = logger;
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
        const globalHeaders = new Set();
        for (const [path, pathDefinition] of Object.entries(this.openApi.paths)) {
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
                const headers = 
            }


        }
        return;
    }

    private getheadersFromMethodParameters(
        parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]): HttpHeaderSchema[] {
        const httpHeaders: HttpHeaderSchema[] = [];
        for (const parameter of parameters) {
            const parameterObject = isParameterReferenceObject(parameter)
                ? this.resolveParameterReference(parameter)
                : parameter;
            if (parameterObject == undefined) {
                continue;
            }
            
        }
    }

    private convertParameterToHeader(parameter: OpenAPIV3.ParameterObject): HttpHeaderSchema | undefined {
        if (parameter.in !== "header") {
            return undefined;
        }
        return {
            "name": parameter.name, 
            "docs": parameter.description, 
            type: parameter.schema
        }
    }

    private resolveParameterReference(parameterReference: OpenAPIV3.ReferenceObject): OpenAPIV3.ParameterObject | undefined {
        if (this.openApi.components == null || this.openApi.components.parameters == null) {
            this.logger.error(`Missing parameter reference: ${parameterReference}`)
            return undefined;
        }
        if (!parameterReference.$ref.startsWith(OpenApiV3Converter.PARAMETER_REFERENCE_PREFIX)) {
            this.logger.error(`Invalid parameter reference: ${parameterReference}`)
            return undefined;
        }
        const parameterKey = parameterReference.$ref.substring(OpenApiV3Converter.length);
        const resolvedParameter = this.openApi.components.parameters[parameterKey];
        if (resolvedParameter == null) {
            this.logger.error(`Missing parameter reference: ${parameterReference}`)
            return undefined;
        }
        if (isParameterReferenceObject(resolvedParameter)) {
            return this.resolveParameterReference(resolvedParameter)
        }
        return resolvedParameter;
    }
}


function isParameterReferenceObject(parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject): parameter is OpenAPIV3.ReferenceObject {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (parameter as OpenAPIV3.ReferenceObject).$ref != null;
}

function isOpenApiV3(openApi: OpenAPI.Document): openApi is OpenAPIV3.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (openApi as OpenAPIV3.Document).openapi != null;
}
