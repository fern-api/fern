import {
    HeaderWithExample,
    PathParameterWithExample,
    PrimitiveSchemaValueWithExample,
    QueryParameterWithExample,
    SchemaId,
    SchemaWithExample,
    Source,
    WebsocketChannel,
    WebsocketMessageSchema,
    WebsocketSessionExample
} from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../getExtension";
import { FernOpenAPIExtension } from "../../openapi/v3/extensions/fernExtensions";
import { ParseOpenAPIOptions } from "../../options";
import { convertAvailability } from "../../schema/convertAvailability";
import { convertReferenceObject, convertSchema } from "../../schema/convertSchemas";
import { convertUndiscriminatedOneOf, UndiscriminatedOneOfPrefix } from "../../schema/convertUndiscriminatedOneOf";
import { convertSchemaWithExampleToSchema } from "../../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../../schema/utils/isReferenceObject";
import { getSchemas } from "../../utils/getSchemas";
import { ExampleWebsocketSessionFactory, SessionExampleBuilderInput } from "../ExampleWebsocketSessionFactory";
import { FernAsyncAPIExtension } from "../fernExtensions";
import { getFernExamples, WebsocketSessionExampleExtension } from "../getFernExamples";
import { ParseAsyncAPIOptions } from "../options";
import { AsyncAPIIntermediateRepresentation } from "../parse";
import { ServerContext } from "../sharedTypes";
import { constructServerUrl, transformToValidPath } from "../sharedUtils";
import { AsyncAPIV2 } from "../v2";
import { AsyncAPIV2ParserContext } from "./AsyncAPIV2ParserContext";

export function parseAsyncAPIV2({
    context,
    breadcrumbs,
    source,
    asyncApiOptions,
    document
}: {
    context: AsyncAPIV2ParserContext;
    breadcrumbs: string[];
    source: Source;
    asyncApiOptions: ParseAsyncAPIOptions;
    document: AsyncAPIV2.DocumentV2;
}): AsyncAPIIntermediateRepresentation {
    const schemas: Record<SchemaId, SchemaWithExample> = {};
    const parsedChannels: Record<string, WebsocketChannel> = {};

    for (const [schemaId, schema] of Object.entries(document.components?.schemas ?? {})) {
        const convertedSchema = convertSchema(schema, false, false, context, [schemaId], source, context.namespace);
        schemas[schemaId] = convertedSchema;
    }

    const exampleFactory = new ExampleWebsocketSessionFactory(schemas, context);

    const servers: Record<string, ServerContext> = {};
    for (const [serverId, server] of Object.entries(document.servers ?? {})) {
        servers[serverId] = {
            // Always preserve server names from AsyncAPI spec
            name: serverId,
            url: constructServerUrl(server.protocol, server.url)
        };
    }

    for (const [channelPath, channel] of Object.entries(document.channels ?? {})) {
        const shouldIgnore = getExtension<boolean>(channel, FernAsyncAPIExtension.IGNORE);
        if (shouldIgnore != null && shouldIgnore) {
            context.logger.debug(`Channel ${channelPath} is marked with x-fern-ignore. Skipping.`);
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
                            ? convertSchema(
                                  parameter.schema,
                                  false,
                                  false,
                                  context,
                                  breadcrumbs,
                                  source,
                                  context.namespace
                              )
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
                                  namespace: undefined,
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
        const queryParameters: QueryParameterWithExample[] = [];
        if (channel.bindings?.ws != null) {
            if (channel.bindings.ws.headers != null) {
                const required = channel.bindings.ws.headers.required ?? [];
                for (const [name, schema] of Object.entries(channel.bindings.ws.headers.properties ?? {})) {
                    if (isReferenceObject(schema)) {
                        const resolvedSchema = context.resolveSchemaReference(schema);
                        headers.push({
                            name,
                            schema: convertReferenceObject(
                                schema,
                                false,
                                false,
                                context,
                                breadcrumbs,
                                undefined,
                                source,
                                context.namespace
                            ),
                            description: resolvedSchema.description,
                            parameterNameOverride: undefined,
                            env: undefined,
                            availability: convertAvailability(resolvedSchema),
                            source
                        });
                        continue;
                    }
                    const isRequired = required.includes(name);
                    const [isOptional, isNullable] = context.options.coerceOptionalSchemasToNullable
                        ? [false, !isRequired]
                        : [!isRequired, false];
                    headers.push({
                        name,
                        schema: convertSchema(
                            schema,
                            isOptional,
                            isNullable,
                            context,
                            [...breadcrumbs, name],
                            source,
                            context.namespace
                        ),
                        description: schema.description,
                        parameterNameOverride: undefined,
                        env: undefined,
                        availability: convertAvailability(schema),
                        source
                    });
                }
            }

            if (channel.bindings.ws.query != null) {
                const required = channel.bindings.ws.query.required ?? [];
                for (const [name, schema] of Object.entries(channel.bindings.ws.query.properties ?? {})) {
                    if (isReferenceObject(schema)) {
                        const resolvedSchema = context.resolveSchemaReference(schema);
                        queryParameters.push({
                            name,
                            schema: convertReferenceObject(
                                schema,
                                false,
                                false,
                                context,
                                breadcrumbs,
                                undefined,
                                source,
                                context.namespace
                            ),
                            description: resolvedSchema.description,
                            parameterNameOverride: undefined,
                            availability: convertAvailability(resolvedSchema),
                            source
                        });
                        continue;
                    }
                    const isRequired = required.includes(name);
                    const [isOptional, isNullable] = context.options.coerceOptionalSchemasToNullable
                        ? [false, !isRequired]
                        : [!isRequired, false];
                    queryParameters.push({
                        name,
                        schema: convertSchema(
                            schema,
                            isOptional,
                            isNullable,
                            context,
                            [...breadcrumbs, name],
                            source,
                            context.namespace
                        ),
                        description: schema.description,
                        parameterNameOverride: undefined,
                        availability: convertAvailability(schema),
                        source
                    });
                }
            }
        }

        let publishSchema: SchemaWithExample | undefined = undefined;
        if (channel.publish != null) {
            if ("oneOf" in channel.publish.message) {
                publishSchema = convertOneOfToSchema({
                    generatedName: channel.publish.operationId ?? "PublishEvent",
                    event: channel.publish,
                    breadcrumbs,
                    context,
                    source,
                    options: context.options,
                    asyncApiOptions
                });
            } else {
                publishSchema = convertMessageToSchema({
                    action: "Publish",
                    channelPath,
                    message: channel.publish.message as AsyncAPIV2.MessageV2,
                    context,
                    source
                });
            }
        }

        let subscribeSchema: SchemaWithExample | undefined = undefined;
        if (channel.subscribe != null) {
            if ("oneOf" in channel.subscribe.message) {
                subscribeSchema = convertOneOfToSchema({
                    generatedName: channel.subscribe.operationId ?? "SubscribeEvent",
                    event: channel.subscribe,
                    breadcrumbs,
                    context,
                    source,
                    options: context.options,
                    asyncApiOptions
                });
            } else {
                subscribeSchema = convertMessageToSchema({
                    action: "Subscribe",
                    channelPath,
                    message: channel.subscribe.message as AsyncAPIV2.MessageV2,
                    context,
                    source
                });
            }
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
                    source,
                    namespace: context.namespace
                });
            } else {
                const exampleBuilderInputs: SessionExampleBuilderInput[] = [];
                if (publishSchema != null) {
                    exampleBuilderInputs.push({
                        type: "publish",
                        payload: publishSchema
                    });
                }
                if (subscribeSchema != null) {
                    exampleBuilderInputs.push({
                        type: "subscribe",
                        payload: subscribeSchema
                    });
                }
                const autogenExample = exampleFactory.buildWebsocketSessionExample({
                    handshake: {
                        headers,
                        queryParameters
                    },
                    messages: exampleBuilderInputs
                });
                if (autogenExample != null) {
                    examples.push(autogenExample);
                }
            }

            const address = getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_CHANNEL_ADDRESS);
            const path = address != null ? address : transformToValidPath(channelPath);
            const messages: WebsocketMessageSchema[] = [];
            if (publishSchema != null) {
                messages.push({
                    origin: "client",
                    name: "publish",
                    body: convertSchemaWithExampleToSchema(publishSchema)
                });
            }
            if (subscribeSchema != null) {
                messages.push({
                    origin: "server",
                    name: "subscribe",
                    body: convertSchemaWithExampleToSchema(subscribeSchema)
                });
            }
            parsedChannels[channelPath] = {
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
                groupName: context.resolveGroupName([
                    getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_SDK_GROUP_NAME) ?? channelPath
                ]),
                messages,
                servers: (channel.servers?.map((serverId) => servers[serverId]) ?? Object.values(servers))
                    .filter((server): server is ServerContext => server != null && server.name != null)
                    .map((server) => ({
                        ...server,
                        name: server.name as string
                    })),
                summary: getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_DISPLAY_NAME),
                path,
                description: channel.description,
                examples,
                source
            };
        }
    }

    return {
        groupedSchemas: getSchemas(context.namespace, schemas),
        channels: parsedChannels != null ? parsedChannels : undefined,
        servers: Object.values(servers).map((server) => ({
            ...server,
            name: server.name as string
        })),
        basePath: getExtension<string | undefined>(document, FernAsyncAPIExtension.BASE_PATH)
    };
}

function convertOneOfToSchema({
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
    if ("oneOf" in event.message && event.message.oneOf != null) {
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
            wrapAsOptional: false,
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

function convertMessageToSchema({
    action,
    channelPath,
    message,
    context,
    source
}: {
    action: "Publish" | "Subscribe";
    channelPath: string;
    message: AsyncAPIV2.MessageV2;
    context: AsyncAPIV2ParserContext;
    source: Source;
}): SchemaWithExample | undefined {
    if (message.payload != null) {
        let resolvedSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject = message.payload;
        if (isReferenceObject(message.payload)) {
            resolvedSchema = context.resolveSchemaReference(message.payload);
        }
        return convertSchema(resolvedSchema, false, false, context, [channelPath, action], source, context.namespace);
    }
    return undefined;
}
