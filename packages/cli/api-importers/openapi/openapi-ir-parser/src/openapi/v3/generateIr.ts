import { generatorsYml } from "@fern-api/configuration";
import { assertNever, isNonNullish } from "@fern-api/core-utils";
import {
    Endpoint,
    EndpointExample,
    EndpointWithExample,
    ErrorExample,
    GlobalSecurity,
    HttpError,
    LiteralSchemaValue,
    ObjectPropertyWithExample,
    ObjectSchema,
    OpenApiIntermediateRepresentation,
    Schema,
    SchemaId,
    SchemaWithExample,
    SecurityScheme,
    Source,
    Webhook,
    WebhookExampleCall,
    WebhookWithExample
} from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { mapValues } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../getExtension.js";
import { ParseOpenAPIOptions } from "../../options.js";
import { convertSchema, resetTitleCollisionTracker } from "../../schema/convertSchemas.js";
import { convertToFullExample } from "../../schema/examples/convertToFullExample.js";
import { ExampleTypeFactory } from "../../schema/examples/ExampleTypeFactory.js";
import { convertSchemaWithExampleToSchema } from "../../schema/utils/convertSchemaWithExampleToSchema.js";
import { getGeneratedTypeName } from "../../schema/utils/getSchemaName.js";
import { isReferenceObject } from "../../schema/utils/isReferenceObject.js";
import { getSchemas } from "../../utils/getSchemas.js";
import { createSchemaCollisionTracker } from "../../utils/schemaCollision.js";
import { AbstractOpenAPIV3ParserContext } from "./AbstractOpenAPIV3ParserContext.js";
import { convertPathItem, convertPathItemToWebhooks } from "./converters/convertPathItem.js";
import { convertSecurityScheme } from "./converters/convertSecurityScheme.js";
import { convertServer } from "./converters/convertServer.js";
import { ERROR_NAMES } from "./converters/convertToHttpError.js";
import { ExampleEndpointFactory } from "./converters/ExampleEndpointFactory.js";
import { ConvertedOperation } from "./converters/operation/convertOperation.js";
import { FernOpenAPIExtension } from "./extensions/fernExtensions.js";
import { getFernBasePath } from "./extensions/getFernBasePath.js";
import { getFernGroups } from "./extensions/getFernGroups.js";
import { getFernVersion } from "./extensions/getFernVersion.js";
import { getGlobalHeaders } from "./extensions/getGlobalHeaders.js";
import { getIdempotencyHeaders } from "./extensions/getIdempotencyHeaders.js";
import { getVariableDefinitions } from "./extensions/getVariableDefinitions.js";
import { getWebhooksPathsObject } from "./getWebhookPathsObject.js";
import { hasIncompleteExample } from "./hasIncompleteExample.js";
import { OpenAPIV3ParserContext } from "./OpenAPIV3ParserContext.js";
import { runResolutions } from "./runResolutions.js";

export function generateIr({
    openApi,
    taskContext,
    options,
    source,
    namespace
}: {
    openApi: OpenAPIV3.Document;
    taskContext: TaskContext;
    options: ParseOpenAPIOptions;
    source: Source;
    namespace: string | undefined;
}): OpenApiIntermediateRepresentation {
    openApi = runResolutions({ openapi: openApi });

    // Reset title collision tracker for this document processing
    resetTitleCollisionTracker();

    // Create a temporary context for reference resolution during security scheme processing
    const tempContext = new OpenAPIV3ParserContext({
        document: openApi,
        taskContext,
        authHeaders: new Set(), // temporary empty set
        options,
        source,
        namespace
    });

    const securitySchemes: Record<string, SecurityScheme> = Object.fromEntries(
        Object.entries(openApi.components?.securitySchemes ?? {})
            .map(([key, securityScheme]) => {
                const convertedSecurityScheme = convertSecurityScheme(securityScheme, source, taskContext, tempContext);
                if (convertedSecurityScheme == null) {
                    return null;
                }
                return [key, convertedSecurityScheme];
            })
            .filter((entry): entry is [string, SecurityScheme] => entry !== null)
    );
    const security: GlobalSecurity | undefined = openApi.security?.filter((requirement) => requirement != null);
    const authHeaders = new Set(
        Object.entries(securitySchemes)
            .map(([_, securityScheme]) => {
                if (
                    securityScheme.type === "basic" ||
                    securityScheme.type === "bearer" ||
                    securityScheme.type === "oauth"
                ) {
                    return "Authorization";
                } else if (securityScheme.type === "header") {
                    return securityScheme.headerName;
                }
                return null;
            })
            .filter((header): header is string => header != null)
    );
    const variables = getVariableDefinitions(openApi, options.preserveSchemaIds);
    const globalHeaders = getGlobalHeaders(openApi);
    const idempotencyHeaders = getIdempotencyHeaders(openApi);
    const audiences = options.audiences ?? [];
    const endpointsWithExample: EndpointWithExample[] = [];
    const webhooksWithExample: WebhookWithExample[] = [];

    const context = new OpenAPIV3ParserContext({
        document: openApi,
        taskContext,
        authHeaders,
        options,
        source,
        namespace
    });

    if (context.filter.hasEndpoints()) {
        taskContext.logger.debug("Endpoint filter applied...");
    }

    Object.entries(openApi.paths ?? {}).forEach(([path, pathItem]) => {
        if (pathItem == null) {
            return;
        }
        const convertedOperations = convertPathItem(path, pathItem, openApi, context);
        for (const operation of convertedOperations) {
            const operationAudiences = getAudiences({ operation });
            if (audiences.length > 0 && !audiences.some((audience) => operationAudiences.includes(audience))) {
                continue;
            }
            switch (operation.type) {
                case "async":
                    endpointsWithExample.push(...operation.sync);
                    endpointsWithExample.push(...operation.async);
                    break;
                case "http":
                    endpointsWithExample.push(...operation.value);
                    break;
                case "streaming":
                    endpointsWithExample.push(...operation.streaming);
                    if (operation.nonStreaming) {
                        endpointsWithExample.push(...operation.nonStreaming);
                    }
                    break;
                case "webhook":
                    webhooksWithExample.push(...operation.value);
                    break;
                default:
                    assertNever(operation);
            }
        }
    });
    Object.entries(getWebhooksPathsObject(openApi)).forEach(([path, pathItem]) => {
        if (pathItem == null) {
            return;
        }
        taskContext.logger.debug(`Converting path ${path}`);
        const convertedWebhooks = convertPathItemToWebhooks(path, pathItem, openApi, context);
        for (const webhook of convertedWebhooks) {
            const webhookAudiences = getAudiences({ operation: webhook });
            if (audiences.length > 0 && !audiences.some((audience) => webhookAudiences.includes(audience))) {
                continue;
            }
            webhooksWithExample.push(...webhook.value);
        }
    });

    const schemasWithExample: Record<string, SchemaWithExample> = Object.fromEntries(
        Object.entries(openApi.components?.schemas ?? {})
            .map(([key, schema]) => {
                const schemaNamespace = getExtension<string>(schema, FernOpenAPIExtension.SDK_NAMESPACE);
                if (!isReferenceObject(schema)) {
                    const ignoreSchema = getExtension<boolean>(schema, FernOpenAPIExtension.IGNORE);
                    if (ignoreSchema != null && ignoreSchema) {
                        return [];
                    }
                    if (ERROR_NAMES.has(key)) {
                        return [
                            key,
                            convertSchema(
                                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
                                { ...schema, "x-fern-type-name": `${key}Body` } as any as OpenAPIV3.SchemaObject,
                                false,
                                false,
                                context,
                                [key],
                                source,
                                schemaNamespace ?? namespace
                            )
                        ];
                    }
                }
                return [key, convertSchema(schema, false, false, context, [key], source, schemaNamespace ?? namespace)];
            })
            .filter((entry) => entry.length > 0)
    );

    // Remove discriminants from discriminated unions since Fern handles this in the IR.
    const schemasWithoutDiscriminants = maybeRemoveDiscriminantsFromSchemas(schemasWithExample, context, source);
    // Add them back when declared as union metadata, as that means we're treating discriminated unions as undiscriminated unions.
    const schemasWithDiscriminants = maybeAddBackDiscriminantsFromSchemas(schemasWithoutDiscriminants, context);
    const collisionTracker = createSchemaCollisionTracker();
    const schemas: Record<string, Schema> = {};
    for (const [key, schemaWithExample] of Object.entries(schemasWithDiscriminants)) {
        const schema = convertSchemaWithExampleToSchema(schemaWithExample);
        if (context.isSchemaExcluded(key)) {
            continue;
        }
        // Use collision tracker for unique key generation
        const uniqueKey = collisionTracker.getUniqueSchemaId(key, context.logger, options.resolveSchemaCollisions);
        schemas[uniqueKey] = schema;
    }

    const exampleTypeFactory = new ExampleTypeFactory(
        schemasWithDiscriminants,
        context.nonRequestReferencedSchemas,
        context
    );

    const webhooks: Webhook[] = webhooksWithExample.map((webhookWithExample) => {
        const extensionExamples = webhookWithExample.examples;
        let examples: WebhookExampleCall[] = extensionExamples;
        if (!options.disableExamples && examples.length === 0) {
            const webhookExample = exampleTypeFactory.buildExample({
                schema: webhookWithExample.payload,
                exampleId: undefined,
                example: undefined,
                skipReadonly: false,
                options: {
                    ignoreOptionals: false,
                    isParameter: false
                }
            });
            if (webhookExample != null) {
                examples = [
                    {
                        name: undefined,
                        description: undefined,
                        payload: webhookExample
                    }
                ];
            }
        }

        return {
            ...webhookWithExample,
            payload: convertSchemaWithExampleToSchema(webhookWithExample.payload),
            examples
        };
    });

    const exampleEndpointFactory = new ExampleEndpointFactory(schemasWithDiscriminants, context, globalHeaders);
    const endpoints = endpointsWithExample.map((endpointWithExample): Endpoint => {
        // if x-fern-examples is not present, generate an example
        const extensionExamples = endpointWithExample.examples;
        let examples: EndpointExample[] = extensionExamples;
        if (
            !options.disableExamples &&
            (extensionExamples.length === 0 || extensionExamples.every(hasIncompleteExample))
        ) {
            const endpointExample = exampleEndpointFactory.buildEndpointExample(endpointWithExample);
            if (endpointExample.length > 0) {
                examples = [
                    ...endpointExample,
                    // Remove incomplete examples (codesamples are included in generated examples)
                    ...extensionExamples.filter((example) => !hasIncompleteExample(example))
                ];
            }
        }

        const request = endpointWithExample.request;
        const response = endpointWithExample.response;

        return {
            ...endpointWithExample,
            request:
                request?.type === "json" || request?.type === "formUrlEncoded"
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
                    parameterNameOverride: queryParameter.parameterNameOverride,
                    explode: queryParameter.explode,
                    availability: queryParameter.availability,
                    source: queryParameter.source
                };
            }),
            pathParameters: endpointWithExample.pathParameters.map((pathParameter) => {
                return {
                    description: pathParameter.description,
                    name: pathParameter.name,
                    schema: convertSchemaWithExampleToSchema(pathParameter.schema),
                    parameterNameOverride: pathParameter.parameterNameOverride,
                    variableReference: pathParameter.variableReference,
                    availability: pathParameter.availability,
                    source: pathParameter.source
                };
            }),
            headers: endpointWithExample.headers.map((header) => {
                return {
                    description: header.description,
                    name: header.name,
                    schema: convertSchemaWithExampleToSchema(header.schema),
                    parameterNameOverride: header.parameterNameOverride,
                    env: header.env,
                    availability: header.availability,
                    source: header.source
                };
            }),
            examples,
            errors: mapValues(endpointWithExample.errors, (error): HttpError => {
                const examples = error.fullExamples
                    ?.map((example): ErrorExample | undefined => {
                        const fullExample = convertToFullExample(example.value);

                        if (fullExample == null) {
                            return undefined;
                        }

                        return {
                            name: example.name,
                            description: example.description,
                            example: fullExample
                        };
                    })
                    .filter(isNonNullish);

                if (examples?.length === 0) {
                    const generatedExample = exampleTypeFactory.buildExample({
                        schema: error.schema,
                        example: undefined,
                        exampleId: undefined,
                        skipReadonly: false,
                        options: {
                            ignoreOptionals: false,
                            isParameter: false
                        }
                    });
                    if (generatedExample != null) {
                        examples.push({
                            name: undefined,
                            description: undefined,
                            example: generatedExample
                        });
                    }
                }

                return {
                    generatedName: error.generatedName,
                    nameOverride: error.nameOverride,
                    schema: convertSchemaWithExampleToSchema(error.schema),
                    description: error.description,
                    source: error.source,
                    examples
                };
            }),
            retries: endpointWithExample.retries
        };
    });

    // Write missing examples report
    exampleEndpointFactory.finalize();

    const groupInfo = getFernGroups({ document: openApi, context });

    const ir: OpenApiIntermediateRepresentation = {
        apiVersion: getFernVersion({
            context,
            document: openApi
        }),
        basePath: getFernBasePath(openApi),
        title: openApi.info.title ?? "",
        description: openApi.info.description,
        groups: Object.fromEntries(
            Object.entries(groupInfo ?? {}).map(([key, value]) => {
                return [key, { summary: value.summary ?? undefined, description: value.description ?? undefined }];
            })
        ),
        servers: (openApi.servers ?? []).map((server) =>
            convertServer(server, { groupMultiApiEnvironments: options.groupMultiApiEnvironments })
        ),
        websocketServers: [],
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
        channels: {},
        groupedSchemas: getSchemas(namespace, schemas),
        securitySchemes,
        security,
        hasEndpointsMarkedInternal: endpoints.some((endpoint) => endpoint.internal),
        nonRequestReferencedSchemas: context.getReferencedSchemas(),
        variables,
        globalHeaders,
        idempotencyHeaders
    };

    return ir;
}

function maybeRemoveDiscriminantsFromSchemas(
    schemas: Record<string, SchemaWithExample>,
    context: AbstractOpenAPIV3ParserContext,
    source: Source
): Record<string, SchemaWithExample> {
    if (context.options.removeDiscriminantsFromSchemas === generatorsYml.RemoveDiscriminantsFromSchemas.Never) {
        return schemas;
    }

    const protectedParents = getParentSchemaIdsWithNonUnionChildren(schemas, context);

    const result: Record<string, SchemaWithExample> = {};
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

        // Check if the schema is also referenced outside of discriminated unions,
        // if so, we cannot remove the discriminants
        const isReferencedElsewhere = context.getReferencedSchemas().has(schemaId);
        if (isReferencedElsewhere) {
            result[schemaId] = schema;
            continue;
        }

        const schemaWithoutDiscriminants: SchemaWithExample.Object_ = {
            ...schema,
            type: "object",
            properties: schema.properties.filter((objectProperty) => {
                return !discriminatedUnionReference.discriminants.has(objectProperty.key);
            }),
            allOfPropertyConflicts: schema.allOfPropertyConflicts.filter((allOfPropertyConflict) => {
                return !discriminatedUnionReference.discriminants.has(allOfPropertyConflict.propertyKey);
            }),
            source
        };
        result[schemaId] = schemaWithoutDiscriminants;

        const parentSchemaIds = getAllParentSchemaIds({ schema, schemas });
        for (const parentSchemaId of [...new Set(parentSchemaIds)]) {
            if (protectedParents.has(parentSchemaId)) {
                continue;
            }
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

/**
 * Collects parent schema IDs that have at least one allOf child NOT participating
 * in any discriminated union. These parents are "shared" across union and non-union
 * schemas, so their discriminant properties must not be stripped.
 */
function getParentSchemaIdsWithNonUnionChildren(
    schemas: Record<string, SchemaWithExample>,
    context: AbstractOpenAPIV3ParserContext
): Set<SchemaId> {
    const protectedParents = new Set<SchemaId>();
    for (const [schemaId, schema] of Object.entries(schemas)) {
        if (schema.type !== "object") {
            continue;
        }
        const ref: OpenAPIV3.ReferenceObject = { $ref: `#/components/schemas/${schemaId}` };
        if (context.getReferencesFromDiscriminatedUnion(ref) != null) {
            continue;
        }
        for (const parentId of getAllParentSchemaIds({ schema, schemas })) {
            protectedParents.add(parentId);
        }
    }
    return protectedParents;
}

function maybeAddBackDiscriminantsFromSchemas(
    schemas: Record<string, SchemaWithExample>,
    context: AbstractOpenAPIV3ParserContext
): Record<string, SchemaWithExample> {
    const result: Record<string, SchemaWithExample> = {};
    for (const [schemaId, schema] of Object.entries(schemas)) {
        if (schema.type !== "object") {
            result[schemaId] = schema;
            continue;
        }
        const referenceToSchema: OpenAPIV3.ReferenceObject = {
            $ref: `#/components/schemas/${schemaId}`
        };
        const metadata = context.getDiscriminatedUnionMetadata(referenceToSchema);
        if (metadata == null) {
            result[schemaId] = schema;
            continue;
        }

        const propertiesWithDiscriminants: ObjectPropertyWithExample[] = [];
        for (const property of schema.properties) {
            if (metadata.discriminants.has(property.key)) {
                const discriminantValue = metadata.discriminants.get(property.key);
                if (discriminantValue != null) {
                    propertiesWithDiscriminants.push({
                        ...property,
                        schema: SchemaWithExample.literal({
                            nameOverride: undefined,
                            generatedName: getGeneratedTypeName(
                                [schema.generatedName, discriminantValue],
                                context.options.preserveSchemaIds
                            ),
                            title: undefined,
                            value: LiteralSchemaValue.string(discriminantValue),
                            namespace: undefined,
                            groupName: undefined,
                            description: undefined,
                            availability: schema.availability
                        })
                    });
                }
            } else {
                propertiesWithDiscriminants.push(property);
            }
        }

        const schemaWithoutDiscriminants: SchemaWithExample.Object_ = {
            ...schema,
            type: "object",
            properties: propertiesWithDiscriminants
        };
        result[schemaId] = schemaWithoutDiscriminants;
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

function distinct<T>(array: T[]): T[] {
    return [...new Set(array)];
}

function getAudiences({ operation }: { operation: ConvertedOperation }): string[] {
    let endpointAudiences: string[] = [];
    switch (operation.type) {
        case "async":
            endpointAudiences = distinct(operation.async.flatMap((op) => op.audiences));
            break;
        case "http":
            endpointAudiences = distinct(operation.value.flatMap((op) => op.audiences));
            break;
        case "streaming":
            endpointAudiences = distinct(operation.streaming.flatMap((op) => op.audiences));
            break;
        case "webhook":
            endpointAudiences = distinct(operation.value.flatMap((op) => op.audiences));
            break;
        default:
            assertNever(operation);
    }
    return endpointAudiences;
}
