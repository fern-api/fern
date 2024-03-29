import { assertNever } from "@fern-api/core-utils";
import {
    Endpoint,
    EndpointWithExample,
    ObjectSchema,
    OpenApiIntermediateRepresentation,
    Schema,
    SchemaId,
    SchemaWithExample,
    SecurityScheme,
    Webhook
} from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../getExtension";
import { convertSchema } from "../../schema/convertSchemas";
import { convertSchemaWithExampleToSchema } from "../../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "./AbstractOpenAPIV3ParserContext";
import { convertPathItem } from "./converters/convertPathItem";
import { convertSecurityScheme } from "./converters/convertSecurityScheme";
import { convertServer } from "./converters/convertServer";
import { ERROR_NAMES } from "./converters/convertToHttpError";
import { ExampleEndpointFactory } from "./converters/ExampleEndpointFactory";
import { FernOpenAPIExtension } from "./extensions/fernExtensions";
import { getFernGroups } from "./extensions/getFernGroups";
import { getGlobalHeaders } from "./extensions/getGlobalHeaders";
import { getVariableDefinitions } from "./extensions/getVariableDefinitions";
import { hasIncompleteExample } from "./hasIncompleteExample";
import { OpenAPIV3ParserContext } from "./OpenAPIV3ParserContext";
import { runResolutions } from "./runResolutions";

export function generateIr({
    openApi,
    taskContext,
    disableExamples
}: {
    openApi: OpenAPIV3.Document;
    taskContext: TaskContext;
    disableExamples: boolean | undefined;
}): OpenApiIntermediateRepresentation {
    openApi = runResolutions({ openapi: openApi });

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
    const globalHeaders = getGlobalHeaders(openApi);

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
                    if (operation.nonStreaming) {
                        endpointsWithExample.push(operation.nonStreaming);
                    }
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
        Object.entries(openApi.components?.schemas ?? {})
            .map(([key, schema]) => {
                if (!isReferenceObject(schema)) {
                    const ignoreSchema = getExtension<boolean>(schema, FernOpenAPIExtension.IGNORE);
                    if (ignoreSchema != null && ignoreSchema) {
                        return [];
                    }
                    if (ERROR_NAMES.has(key)) {
                        return [
                            key,
                            convertSchema(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                { ...schema, "x-fern-type-name": `${key}Body` } as any as OpenAPIV3.SchemaObject,
                                false,
                                context,
                                [key]
                            )
                        ];
                    }
                }
                return [key, convertSchema(schema, false, context, [key])];
            })
            .filter((entry) => entry.length > 0)
    );
    const exampleEndpointFactory = new ExampleEndpointFactory(schemasWithExample, context.logger);
    const endpoints = endpointsWithExample.map((endpointWithExample): Endpoint => {
        // if x-fern-examples is not present, generate an example
        let examples = endpointWithExample.examples;
        if (!disableExamples && (examples.length === 0 || examples.every(hasIncompleteExample))) {
            const endpointExample = exampleEndpointFactory.buildEndpointExample(endpointWithExample);
            if (endpointExample != null) {
                examples = [
                    endpointExample,
                    // Remove incomplete examples (codesamples are included in generated examples)
                    ...endpointWithExample.examples.filter((example) => !hasIncompleteExample(example))
                ];
            }
        }

        const request = endpointWithExample.request;
        const response = endpointWithExample.response;

        return {
            ...endpointWithExample,
            request:
                request?.type === "json"
                    ? {
                          ...request,
                          schema: convertSchemaWithExampleToSchema(request.schema)
                      }
                    : request,
            response:
                response?.type === "json"
                    ? {
                          ...response,
                          schema: convertSchemaWithExampleToSchema(response.schema)
                      }
                    : response,
            queryParameters: endpointWithExample.queryParameters.map((queryParameter) => {
                return {
                    description: queryParameter.description,
                    name: queryParameter.name,
                    schema: convertSchemaWithExampleToSchema(queryParameter.schema),
                    parameterNameOverride: queryParameter.parameterNameOverride
                };
            }),
            pathParameters: endpointWithExample.pathParameters.map((pathParameter) => {
                return {
                    description: pathParameter.description,
                    name: pathParameter.name,
                    schema: convertSchemaWithExampleToSchema(pathParameter.schema),
                    variableReference: pathParameter.variableReference
                };
            }),
            headers: endpointWithExample.headers.map((header) => {
                return {
                    description: header.description,
                    name: header.name,
                    schema: convertSchemaWithExampleToSchema(header.schema),
                    parameterNameOverride: header.parameterNameOverride,
                    env: header.env
                };
            }),
            examples
        };
    });

    const schemas: Record<string, Schema> = {};
    for (const [key, schemaWithExample] of Object.entries(schemasWithExample)) {
        const schema = convertSchemaWithExampleToSchema(schemaWithExample);
        if (context.isSchemaExcluded(key)) {
            continue;
        }
        schemas[key] = schema;
        taskContext.logger.debug(`Converted schema ${key}`);
    }

    const groupInfo = getFernGroups({ document: openApi, context });

    const ir: OpenApiIntermediateRepresentation = {
        title: openApi.info.title,
        description: openApi.info.description,
        groups: Object.fromEntries(
            Object.entries(groupInfo ?? {}).map(([key, value]) => {
                return [key, { summary: value.summary ?? undefined, description: value.description ?? undefined }];
            })
        ),
        servers: (openApi.servers ?? []).map((server) => convertServer(server)),
        tags: {
            tagsById: Object.fromEntries(
                (openApi.tags ?? []).map((tag) => {
                    return [tag.name, { id: tag.name, description: tag.description }];
                })
            ),
            orderedTagIds: openApi.tags?.map((tag) => tag.name)
        },
        endpoints,
        webhooks,
        channel: [],
        schemas: maybeRemoveDiscriminantsFromSchemas(schemas, context),
        securitySchemes,
        hasEndpointsMarkedInternal: endpoints.some((endpoint) => endpoint.internal),
        errors: context.getErrors(),
        nonRequestReferencedSchemas: context.getReferencedSchemas(),
        variables,
        globalHeaders
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
            $ref: `#/components/schemas/${schemaId}`
        };
        const discriminatedUnionReference = context.getReferencesFromDiscriminatedUnion(referenceToSchema);
        if (discriminatedUnionReference == null) {
            result[schemaId] = schema;
            continue;
        }

        const schemaWithoutDiscriminants: Schema.Object_ = {
            ...schema,
            type: "object",
            properties: schema.properties.filter((objectProperty) => {
                return !discriminatedUnionReference.discriminants.has(objectProperty.key);
            }),
            allOfPropertyConflicts: schema.allOfPropertyConflicts.filter((allOfPropertyConflict) => {
                return !discriminatedUnionReference.discriminants.has(allOfPropertyConflict.propertyKey);
            })
        };
        result[schemaId] = schemaWithoutDiscriminants;

        const parentSchemaIds = getAllParentSchemaIds({ schema, schemas });
        for (const parentSchemaId of [...new Set(parentSchemaIds)]) {
            const parentSchema = result[parentSchemaId] ?? schemas[parentSchemaId];
            if (parentSchema == null || parentSchema.type !== "object") {
                continue;
            }
            result[parentSchemaId] = {
                ...parentSchema,
                type: "object",
                properties: parentSchema.properties.filter((objectProperty) => {
                    return !discriminatedUnionReference.discriminants.has(objectProperty.key);
                }),
                allOfPropertyConflicts: parentSchema.allOfPropertyConflicts.filter((allOfPropertyConflict) => {
                    return !discriminatedUnionReference.discriminants.has(allOfPropertyConflict.propertyKey);
                })
            };
        }
    }
    return result;
}

function getAllParentSchemaIds({
    schema,
    schemas
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
