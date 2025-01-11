import { OpenAPIV3 } from "openapi-types";

import {
    HeaderWithExample,
    PathParameterWithExample,
    PrimitiveSchemaValueWithExample,
    QueryParameterWithExample,
    SchemaId,
    SchemaWithExample,
    Schemas,
    Source,
    WebsocketChannel,
    WebsocketSessionExample
} from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";

import { getExtension } from "../getExtension";
import { FernOpenAPIExtension } from "../openapi/v3/extensions/fernExtensions";
import { ParseOpenAPIOptions } from "../options";
import { convertAvailability } from "../schema/convertAvailability";
import { convertSchema } from "../schema/convertSchemas";
import { UndiscriminatedOneOfPrefix, convertUndiscriminatedOneOf } from "../schema/convertUndiscriminatedOneOf";
import { convertSchemaWithExampleToSchema } from "../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../schema/utils/isReferenceObject";
import { getSchemas } from "../utils/getSchemas";
import { AsyncAPIV2ParserContext } from "./AsyncAPIParserContext";
import { ExampleWebsocketSessionFactory } from "./ExampleWebsocketSessionFactory";
import { FernAsyncAPIExtension } from "./fernExtensions";
import { WebsocketSessionExampleExtension, getFernExamples } from "./getFernExamples";
import { ParseAsyncAPIOptions } from "./options";
import { AsyncAPIV2 } from "./v2";

export interface AsyncAPIIntermediateRepresentation {
    groupedSchemas: Schemas;
    channel: WebsocketChannel | undefined;
    basePath: string | undefined;
}

export function parseAsyncAPI({
    document,
    taskContext,
    options,
    source,
    asyncApiOptions,
    namespace
}: {
    document: AsyncAPIV2.Document;
    taskContext: TaskContext;
    options: ParseOpenAPIOptions;
    source: Source;
    asyncApiOptions: ParseAsyncAPIOptions;
    namespace: string | undefined;
}): AsyncAPIIntermediateRepresentation {
    const breadcrumbs: string[] = [];
    if (namespace != null) {
        breadcrumbs.push(namespace);
    }
    if (document.tags?.[0] != null) {
        breadcrumbs.push(document.tags[0].name);
    } else if (asyncApiOptions.naming !== "v2") {
        // In improved naming, we allow you to not have any prefixes here at all
        // by not specifying tags. Without useImprovedMessageNaming, and no tags,
        // we do still prefix with "Websocket".
        breadcrumbs.push("websocket");
    }

    const context = new AsyncAPIV2ParserContext({
        document,
        taskContext,
        options,
        namespace
    });

    const schemas: Record<SchemaId, SchemaWithExample> = {};
    let parsedChannel: WebsocketChannel | undefined = undefined;

    for (const [schemaId, schema] of Object.entries(document.components?.schemas ?? {})) {
        const convertedSchema = convertSchema(schema, false, context, [schemaId], source, namespace);
        schemas[schemaId] = convertedSchema;
    }

    const exampleFactory = new ExampleWebsocketSessionFactory(schemas, context);

    for (const [channelPath, channel] of Object.entries(document.channels ?? {})) {
        if (channel.bindings?.ws == null) {
            context.logger.error(`Channel ${channelPath} does not have websocket bindings. Skipping.`);
            continue;
        }

        const pathParameters: PathParameterWithExample[] = [];
        if (channel.parameters != null) {
            for (const [name, parameter] of Object.entries(channel.parameters ?? {})) {
                pathParameters.push({
                    name,
                    description: parameter.description,
                    parameterNameOverride: undefined,
                    schema:
                        parameter.schema != null
                            ? convertSchema(parameter.schema, false, context, breadcrumbs, source, namespace)
                            : SchemaWithExample.primitive({
                                  schema: PrimitiveSchemaValueWithExample.string({
                                      default: undefined,
                                      pattern: undefined,
                                      format: undefined,
                                      maxLength: undefined,
                                      minLength: undefined,
                                      example: undefined
                                  }),
                                  description: undefined,
                                  availability: undefined,
                                  generatedName: "",
                                  title: undefined,
                                  groupName: undefined,
                                  nameOverride: undefined
                              }),
                    variableReference: undefined,
                    availability: convertAvailability(parameter),
                    source
                });
            }
        }

        const headers: HeaderWithExample[] = [];
        if (channel.bindings.ws.headers != null) {
            const required = channel.bindings.ws.headers.required ?? [];
            for (const [name, schema] of Object.entries(channel.bindings.ws.headers.properties ?? {})) {
                const resolvedHeader = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;
                headers.push({
                    name,
                    schema: convertSchema(
                        resolvedHeader,
                        !required.includes(name),
                        context,
                        breadcrumbs,
                        source,
                        namespace
                    ),
                    description: resolvedHeader.description,
                    parameterNameOverride: undefined,
                    env: undefined,
                    availability: convertAvailability(resolvedHeader),
                    source
                });
            }
        }

        const queryParameters: QueryParameterWithExample[] = [];
        if (channel.bindings.ws.query != null) {
            const required = channel.bindings.ws.query.required ?? [];
            for (const [name, schema] of Object.entries(channel.bindings.ws.query.properties ?? {})) {
                const resolvedQueryParameter = isReferenceObject(schema)
                    ? context.resolveSchemaReference(schema)
                    : schema;
                queryParameters.push({
                    name,
                    schema: convertSchema(
                        resolvedQueryParameter,
                        !required.includes(name),
                        context,
                        breadcrumbs,
                        source,
                        namespace
                    ),
                    description: resolvedQueryParameter.description,
                    parameterNameOverride: undefined,
                    availability: convertAvailability(resolvedQueryParameter),
                    source
                });
            }
        }

        let publishSchema: SchemaWithExample | undefined = undefined;
        if (channel.publish != null) {
            publishSchema = convertMessageToSchema({
                generatedName: channel.publish.operationId ?? "PublishEvent",
                event: channel.publish,
                breadcrumbs,
                context,
                source,
                options,
                asyncApiOptions
            });
        }

        let subscribeSchema: SchemaWithExample | undefined = undefined;
        if (channel.subscribe != null) {
            subscribeSchema = convertMessageToSchema({
                generatedName: channel.subscribe.operationId ?? "SubscribeEvent",
                event: channel.subscribe,
                breadcrumbs,
                context,
                source,
                options,
                asyncApiOptions
            });
        }

        if (headers.length > 0 || queryParameters.length > 0 || publishSchema != null || subscribeSchema != null) {
            // Reads the `x-fern-examples` extension from the channel
            const fernExamples: WebsocketSessionExampleExtension[] = getFernExamples(channel);
            let examples: WebsocketSessionExample[] = [];
            if (fernExamples.length > 0) {
                examples = exampleFactory.buildWebsocketSessionExamplesForExtension({
                    context,
                    extensionExamples: fernExamples,
                    handshake: {
                        headers,
                        queryParameters
                    },
                    publish: publishSchema,
                    subscribe: subscribeSchema,
                    source,
                    namespace
                });
            } else {
                const autogenExample = exampleFactory.buildWebsocketSessionExample({
                    handshake: {
                        headers,
                        queryParameters
                    },
                    publish: publishSchema,
                    subscribe: subscribeSchema
                });
                if (autogenExample != null) {
                    examples.push(autogenExample);
                }
            }

            const tags = document.tags?.[0]?.name != null ? [document.tags?.[0].name] : undefined;
            parsedChannel = {
                audiences: getExtension<string[] | undefined>(channel, FernOpenAPIExtension.AUDIENCES) ?? [],
                handshake: {
                    headers: headers.map((header) => {
                        return {
                            ...header,
                            schema: convertSchemaWithExampleToSchema(header.schema),
                            env: header.env
                        };
                    }),
                    queryParameters: queryParameters.map((param) => {
                        return {
                            ...param,
                            schema: convertSchemaWithExampleToSchema(param.schema)
                        };
                    }),
                    pathParameters: pathParameters.map((param) => {
                        return {
                            ...param,
                            parameterNameOverride: undefined, // come back
                            schema: convertSchemaWithExampleToSchema(param.schema)
                        };
                    })
                },
                groupName: context.resolveTags(tags, "Websocket"),
                publish: publishSchema != null ? convertSchemaWithExampleToSchema(publishSchema) : publishSchema,
                subscribe:
                    subscribeSchema != null ? convertSchemaWithExampleToSchema(subscribeSchema) : subscribeSchema,
                summary: getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_DISPLAY_NAME),
                path: channelPath,
                description: undefined,
                examples,
                source
            };
            break;
        }
    }

    return {
        groupedSchemas: getSchemas(namespace, schemas),
        channel: parsedChannel,
        basePath: getExtension<string | undefined>(document, FernAsyncAPIExtension.BASE_PATH)
    };
}

function convertMessageToSchema({
    generatedName,
    event,
    context,
    breadcrumbs,
    source,
    options,
    asyncApiOptions
}: {
    breadcrumbs: string[];
    generatedName: string;
    event: AsyncAPIV2.PublishEvent | AsyncAPIV2.SubscribeEvent;
    context: AsyncAPIV2ParserContext;
    source: Source;
    options: ParseOpenAPIOptions;
    asyncApiOptions: ParseAsyncAPIOptions;
}): SchemaWithExample | undefined {
    if (event.message.oneOf != null) {
        const subtypes: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [];
        const prefixes: UndiscriminatedOneOfPrefix[] = [];
        for (const schema of event.message.oneOf) {
            let resolvedSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
            let namePrefix: UndiscriminatedOneOfPrefix = { type: "notFound" };
            if (isReferenceObject(schema)) {
                const resolvedMessage = context.resolveMessageReference(schema);
                if (!isReferenceObject(resolvedMessage.payload) && asyncApiOptions.naming === "v2") {
                    namePrefix = resolvedMessage.name ? { type: "name", name: resolvedMessage.name } : namePrefix;
                    resolvedSchema = {
                        ...resolvedMessage.payload,
                        title: resolvedMessage.name ?? resolvedMessage.payload.title,
                        description: resolvedMessage.name ?? resolvedMessage.payload.description
                    };
                } else {
                    resolvedSchema = resolvedMessage.payload;
                }
            } else {
                resolvedSchema = schema;
            }
            prefixes.push(namePrefix);
            subtypes.push(resolvedSchema);
        }
        return convertUndiscriminatedOneOf({
            description: event.description ?? event.message.description,
            availability: convertAvailability(event.message),
            subtypes,
            nameOverride: event.operationId,
            generatedName,
            title: event.message.title,
            groupName: undefined,
            wrapAsNullable: false,
            breadcrumbs,
            context,
            encoding: undefined,
            source,
            namespace: context.namespace,
            subtypePrefixOverrides: asyncApiOptions.naming === "v2" ? prefixes : []
        });
    }
    return undefined;
}
