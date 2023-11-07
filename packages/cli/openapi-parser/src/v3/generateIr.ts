import { assertNever } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { SchemaId, SecurityScheme } from "@fern-fern/openapi-ir-model/commons";
import {
    Endpoint,
    ObjectSchema,
    OpenAPIIntermediateRepresentation,
    Schema,
    Webhook,
} from "@fern-fern/openapi-ir-model/finalIr";
import { EndpointWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "./AbstractOpenAPIV3ParserContext";
import { convertPathItem } from "./converters/convertPathItem";
import { convertSchema } from "./converters/convertSchemas";
import { convertSecurityScheme } from "./converters/convertSecurityScheme";
import { convertServer } from "./converters/convertServer";
import { ExampleEndpointFactory } from "./converters/example/ExampleEndpointFactory";
import { getVariableDefinitions } from "./extensions/getVariableDefinitions";
import { OpenAPIV3ParserContext } from "./OpenAPIV3ParserContext";
import { convertSchemaWithExampleToSchema } from "./utils/convertSchemaWithExampleToSchema";

export function generateIr(openApi: OpenAPIV3.Document, taskContext: TaskContext): OpenAPIIntermediateRepresentation {
    const securitySchemes: Record<string, SecurityScheme> = Object.fromEntries(
        Object.entries(openApi.components?.securitySchemes ?? {}).map(([key, securityScheme]) => {
            const convertedSecurityScheme = convertSecurityScheme(securityScheme);
            if (convertedSecurityScheme == null) {
                return [];
            }
            return [key, convertSecurityScheme(securityScheme)];
        })
    );
    const authHeaders = new Set(
        ...Object.entries(securitySchemes).map(([_, securityScheme]) => {
            if (securityScheme.type === "basic" || securityScheme.type === "bearer") {
                return "Authorization";
            } else if (securityScheme.type === "header") {
                return securityScheme.headerName;
            }
            return null;
        })
    );
    const context = new OpenAPIV3ParserContext({ document: openApi, taskContext, authHeaders });
    const variables = getVariableDefinitions(openApi);

    const endpointsWithExample: EndpointWithExample[] = [];
    const webhooks: Webhook[] = [];
    Object.entries(openApi.paths).forEach(([path, pathItem]) => {
        if (pathItem == null) {
            return;
        }
        taskContext.logger.debug(`Converting path ${path}`);
        const pathWithoutTrailingSlash = path.replace(/\/$/, "");
        const convertedOperations = convertPathItem(pathWithoutTrailingSlash, pathItem, openApi, context);

        for (const operation of convertedOperations) {
            switch (operation.type) {
                case "async":
                    endpointsWithExample.push(operation.sync);
                    endpointsWithExample.push(operation.async);
                    break;
                case "http":
                    endpointsWithExample.push(operation.value);
                    break;
                case "streaming":
                    endpointsWithExample.push(operation.streaming);
                    endpointsWithExample.push(operation.nonStreaming);
                    break;
                case "webhook":
                    webhooks.push(operation.value);
                    break;
                default:
                    assertNever(operation);
            }
        }
    });

    const schemasWithExample: Record<string, SchemaWithExample> = Object.fromEntries(
        Object.entries(openApi.components?.schemas ?? {}).map(([key, schema]) => {
            return [key, convertSchema(schema, false, context, [key])];
        })
    );
    const exampleEndpointFactory = new ExampleEndpointFactory(schemasWithExample, context.logger);
    const endpoints = endpointsWithExample.map((endpointWithExample): Endpoint => {
        const endpointExample = exampleEndpointFactory.buildEndpointExample(endpointWithExample);
        const request = endpointWithExample.request;
        const response = endpointWithExample.response;
        return {
            ...endpointWithExample,
            request:
                request?.type === "json"
                    ? {
                          ...request,
                          schema: convertSchemaWithExampleToSchema(request.schema),
                      }
                    : request,
            response:
                response?.type === "json"
                    ? {
                          ...response,
                          schema: convertSchemaWithExampleToSchema(response.schema),
                      }
                    : response,
            queryParameters: endpointWithExample.queryParameters.map((queryParameter) => {
                return {
                    description: queryParameter.description,
                    name: queryParameter.name,
                    schema: convertSchemaWithExampleToSchema(queryParameter.schema),
                };
            }),
            pathParameters: endpointWithExample.pathParameters.map((pathParameter) => {
                return {
                    description: pathParameter.description,
                    name: pathParameter.name,
                    schema: convertSchemaWithExampleToSchema(pathParameter.schema),
                    variableReference: pathParameter.variableReference,
                };
            }),
            headers: endpointWithExample.headers.map((header) => {
                return {
                    description: header.description,
                    name: header.name,
                    schema: convertSchemaWithExampleToSchema(header.schema),
                };
            }),
            examples: endpointExample == null ? [] : [endpointExample],
        };
    });

    const schemas: Record<string, Schema> = Object.fromEntries(
        Object.entries(schemasWithExample).map(([key, schemaWithExample]) => {
            taskContext.logger.debug(`Converting schema ${key}`);
            return [key, convertSchemaWithExampleToSchema(schemaWithExample)];
        })
    );

    const ir: OpenAPIIntermediateRepresentation = {
        title: openApi.info.title,
        description: openApi.info.description,
        servers: (openApi.servers ?? []).map((server) => convertServer(server)),
        tags: Object.fromEntries(
            (openApi.tags ?? []).map((tag) => {
                return [tag.name, { id: tag.name, description: tag.description }];
            })
        ),
        endpoints,
        webhooks,
        schemas: maybeRemoveDiscriminantsFromSchemas(schemas, context),
        securitySchemes,
        hasEndpointsMarkedInternal: endpoints.some((endpoint) => endpoint.internal),
        errors: context.getErrors(),
        nonRequestReferencedSchemas: Array.from(context.getReferencedSchemas()),
        variables,
    };

    return ir;
}

function maybeRemoveDiscriminantsFromSchemas(
    schemas: Record<string, Schema>,
    context: AbstractOpenAPIV3ParserContext
): Record<string, Schema> {
    const result: Record<string, Schema> = {};
    for (const [schemaId, schema] of Object.entries(schemas)) {
        if (schema.type !== "object") {
            result[schemaId] = schema;
            continue;
        }
        const referenceToSchema: OpenAPIV3.ReferenceObject = {
            $ref: `#/components/schemas/${schemaId}`,
        };
        const discriminatedUnionReference = context.getReferencesFromDiscriminatedUnion(referenceToSchema);
        if (discriminatedUnionReference == null) {
            result[schemaId] = schema;
            continue;
        }

        const schemaWithoutDiscriminants = Schema.object({
            ...schema,
            properties: schema.properties.filter((objectProperty) => {
                return !discriminatedUnionReference.discriminants.has(objectProperty.key);
            }),
            allOfPropertyConflicts: schema.allOfPropertyConflicts.filter((allOfPropertyConflict) => {
                return !discriminatedUnionReference.discriminants.has(allOfPropertyConflict.propertyKey);
            }),
        });
        result[schemaId] = schemaWithoutDiscriminants;

        const parentSchemaIds = getAllParentSchemaIds({ schema, schemas });
        for (const parentSchemaId of [...new Set(parentSchemaIds)]) {
            const parentSchema = result[parentSchemaId] ?? schemas[parentSchemaId];
            if (parentSchema == null || parentSchema.type !== "object") {
                continue;
            }
            result[parentSchemaId] = Schema.object({
                ...parentSchema,
                properties: parentSchema.properties.filter((objectProperty) => {
                    return !discriminatedUnionReference.discriminants.has(objectProperty.key);
                }),
                allOfPropertyConflicts: parentSchema.allOfPropertyConflicts.filter((allOfPropertyConflict) => {
                    return !discriminatedUnionReference.discriminants.has(allOfPropertyConflict.propertyKey);
                }),
            });
        }
    }
    return result;
}

function getAllParentSchemaIds({
    schema,
    schemas,
}: {
    schema: ObjectSchema;
    schemas: Record<string, Schema>;
}): SchemaId[] {
    const result: SchemaId[] = [];
    for (const allOfSchema of schema.allOf) {
        result.push(allOfSchema.schema);
        const allOfSchemaDefinition = schemas[allOfSchema.schema];
        if (allOfSchemaDefinition != null && allOfSchemaDefinition.type === "object") {
            result.push(...getAllParentSchemaIds({ schema: allOfSchemaDefinition, schemas }));
        }
    }
    return result;
}
