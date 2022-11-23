import { Logger } from "@fern-api/logger";
import { OpenAPIV3 } from "openapi-types";
import { AbstractConvertedSchema } from "./convertedTypes/abstractConvertedSchema";
import { OpenApiV3ReferenceResolver } from "./OpenApiV3ReferenceResolver";

export interface EndpointDefinition {
    path: string;
    httpMethod: OpenAPIV3.HttpMethods;
    definition: OpenAPIV3.OperationObject;
}

export class OpenApiV3Context {
    private referenceResolver: OpenApiV3ReferenceResolver;
    private openApiV3: OpenAPIV3.Document;
    private endpointDefinitions: EndpointDefinition[];
    private types: Record<string, AbstractConvertedSchema> = {};

    constructor({ openApiV3, logger }: { openApiV3: OpenAPIV3.Document; logger: Logger }) {
        this.openApiV3 = openApiV3;
        this.referenceResolver = new OpenApiV3ReferenceResolver({ openApiV3, logger });
        this.endpointDefinitions = this.createPathDefinitions();
    }

    public getSchema(schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject | undefined {
        return isReferenceObject(schema) ? this.referenceResolver.resolveSchemaReference(schema) : schema;
    }

    public getParameter(
        parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
    ): OpenAPIV3.ParameterObject | undefined {
        return isReferenceObject(parameter) ? this.referenceResolver.resolveParameterReference(parameter) : parameter;
    }

    public getEndpoints(): EndpointDefinition[] {
        return this.endpointDefinitions;
    }

    public createSchemasForRequest({
        requestBody,
    }: {
        requestBody: OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject;
    }): void {
        if (isReferenceObject(requestBody)) {
            const schemaObject = this.getSchema(requestBody);
        }
        return;
    }

    public getOrCreateSchema(schemaObject: OpenAPIV3.SchemaObject): void {
        if (schemaObject.)
        return;
    }

    private createPathDefinitions(): EndpointDefinition[] {
        const pathDefinitions: EndpointDefinition[] = [];
        for (const [path, pathDefinition] of Object.entries(this.openApiV3.paths)) {
            if (pathDefinition == null) {
                continue;
            }
            for (const httpMethod of Object.values(OpenAPIV3.HttpMethods)) {
                const httpMethodDefinition = pathDefinition[httpMethod];
                if (httpMethodDefinition == null) {
                    continue;
                }
                pathDefinitions.push({
                    path,
                    httpMethod,
                    definition: httpMethodDefinition,
                });
            }
        }
        return pathDefinitions;
    }
}

function isReferenceObject(
    parameter:
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.ParameterObject
        | OpenAPIV3.SchemaObject
        | OpenAPIV3.RequestBodyObject
): parameter is OpenAPIV3.ReferenceObject {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (parameter as OpenAPIV3.ReferenceObject).$ref != null;
}
