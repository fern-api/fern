import { camelCase, upperFirst } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";

import {
    HeaderWithExample,
    PathParameterWithExample,
    QueryParameterWithExample,
    SchemaId,
    SchemaWithExample,
    Source,
    WebsocketChannel,
    WebsocketMessageSchema,
    WebsocketSessionExample
} from "@fern-api/openapi-ir";

import { FernOpenAPIExtension } from "../..";
import { getExtension } from "../../getExtension";
import { convertAvailability } from "../../schema/convertAvailability";
import { convertSchema } from "../../schema/convertSchemas";
import { convertSchemaWithExampleToSchema } from "../../schema/utils/convertSchemaWithExampleToSchema";
import { getSchemas } from "../../utils/getSchemas";
import { ExampleWebsocketSessionFactory, SessionExampleBuilderInput } from "../ExampleWebsocketSessionFactory";
import { FernAsyncAPIExtension } from "../fernExtensions";
import { WebsocketSessionExampleExtension, getFernExamples } from "../getFernExamples";
import { ParseAsyncAPIOptions } from "../options";
import { AsyncAPIIntermediateRepresentation } from "../parse";
import { ChannelId, ServerContext } from "../sharedTypes";
import { constructServerUrl, transformToValidPath } from "../sharedUtils";
import { AsyncAPIV3 } from "../v3";
import { AsyncAPIV3ParserContext } from "./AsyncAPIV3ParserContext";

interface ChannelEvents {
    subscribe: OpenAPIV3.ReferenceObject[];
    publish: OpenAPIV3.ReferenceObject[];
    __parsedMessages: WebsocketMessageSchema[];
}

const CHANNEL_REFERENCE_PREFIX = "#/channels/";
const SERVER_REFERENCE_PREFIX = "#/servers/";
const LOCATION_PREFIX = "$message.";

interface SeenMessage {
    channelId: string;
    payload: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
}

export function parseAsyncAPIV3({
    context,
    breadcrumbs,
    source,
    asyncApiOptions,
    document
}: {
    context: AsyncAPIV3ParserContext;
    breadcrumbs: string[];
    source: Source;
    asyncApiOptions: ParseAsyncAPIOptions;
    document: AsyncAPIV3.DocumentV3;
}): AsyncAPIIntermediateRepresentation {
    const schemas: Record<SchemaId, SchemaWithExample> = {};
    const messageSchemas: Record<ChannelId, Record<SchemaId, SchemaWithExample>> = {};
    const seenMessages: Record<string, SeenMessage[]> = {};
    const duplicatedMessageIds: Array<SchemaId> = [];
    const parsedChannels: Record<string, WebsocketChannel> = {};

    for (const [schemaId, schema] of Object.entries(document.components?.schemas ?? {})) {
        schemas[schemaId] = convertSchema(schema, false, context, [schemaId], source, context.namespace);
    }

    for (const [channelId, channel] of Object.entries(document.channels ?? {})) {
        if (!messageSchemas[channelId]) {
            messageSchemas[channelId] = {};
        }
        if (channel.messages) {
            for (const [messageId, message] of Object.entries(channel.messages)) {
                if (context.isReferenceObject(message) || context.isMessageWithPayload(message)) {
                    if (!seenMessages[messageId]) {
                        seenMessages[messageId] = [];
                    }
                    if (context.isReferenceObject(message)) {
                        const resolved = context.resolveMessageReference(message);
                        seenMessages[messageId].push({
                            channelId,
                            payload: resolved.payload
                        });
                    } else {
                        seenMessages[messageId].push({
                            channelId,
                            payload: message.payload
                        });
                    }
                }
            }
        }
    }

    for (const [originalMessageId, occurrences] of Object.entries(seenMessages)) {
        if (occurrences.length === 1) {
            const occurrence = occurrences[0] as SeenMessage;
            const occurrenceChannelId = occurrence.channelId as ChannelId;
            messageSchemas[occurrenceChannelId] = messageSchemas[occurrenceChannelId] || {};
            messageSchemas[occurrenceChannelId][originalMessageId] = convertSchema(
                occurrence.payload,
                false,
                context,
                [originalMessageId],
                source,
                context.namespace
            );
        } else {
            duplicatedMessageIds.push(originalMessageId);

            for (const { channelId, payload } of occurrences) {
                const newSchemaId = `${channelId}_${originalMessageId}`;
                if (!messageSchemas[channelId]) {
                    messageSchemas[channelId] = {};
                }
                messageSchemas[channelId][newSchemaId] = convertSchema(
                    payload,
                    false,
                    context,
                    [newSchemaId],
                    source,
                    context.namespace
                );
            }
        }
    }

    const flattenedMessageSchemas: Record<string, SchemaWithExample> = Object.values(messageSchemas).reduce(
        (acc, schemas) => ({ ...acc, ...schemas }),
        {}
    );
    const exampleFactory = new ExampleWebsocketSessionFactory(flattenedMessageSchemas, context);

    const servers: Record<string, ServerContext> = {};
    for (const [serverId, server] of Object.entries(document.servers ?? {})) {
        servers[serverId] = {
            name: serverId,
            url: constructServerUrl(server.protocol, server.host)
        };
    }

    const channelEvents: Record<string, ChannelEvents> = {};
    for (const [operationId, operation] of Object.entries(document.operations ?? {})) {
        if (getExtension<boolean>(operation, FernAsyncAPIExtension.IGNORE)) {
            continue;
        }

        const channelPath = getChannelPathFromOperation(operation);
        if (!channelEvents[channelPath]) {
            channelEvents[channelPath] = { subscribe: [], publish: [], __parsedMessages: [] };
        }

        if (operation.action === "receive") {
            channelEvents[channelPath].subscribe.push(...operation.messages);
        } else if (operation.action === "send") {
            channelEvents[channelPath].publish.push(...operation.messages);
        } else {
            throw new Error(`Operation ${operationId} has an invalid action: ${operation.action}`);
        }
    }

    for (const [channelPath, events] of Object.entries(channelEvents)) {
        const channelMessages: WebsocketMessageSchema[] = [];

        channelMessages.push(
            ...convertMessageReferencesToWebsocketSchemas({
                messages: events.subscribe,
                channelPath,
                origin: "server",
                messageSchemas: messageSchemas[channelPath] ?? {},
                duplicatedMessageIds,
                context
            })
        );

        channelMessages.push(
            ...convertMessageReferencesToWebsocketSchemas({
                messages: events.publish,
                channelPath,
                origin: "client",
                messageSchemas: messageSchemas[channelPath] ?? {},
                duplicatedMessageIds,
                context
            })
        );

        if (channelEvents[channelPath] != null) {
            channelEvents[channelPath].__parsedMessages = channelMessages;
        }
    }

    for (const [channelPath, channel] of Object.entries(document.channels ?? {})) {
        if (getExtension<boolean>(channel, FernAsyncAPIExtension.IGNORE)) {
            continue;
        }

        const headers: HeaderWithExample[] = [];
        const pathParameters: PathParameterWithExample[] = [];
        const queryParameters: QueryParameterWithExample[] = [];
        if (channel.parameters != null) {
            for (const [name, parameter] of Object.entries(channel.parameters)) {
                const { type, parameterKey } = convertChannelParameterLocation(parameter.location);
                const isOptional = getExtension<boolean>(parameter, FernAsyncAPIExtension.FERN_PARAMETER_OPTIONAL);
                const parameterName = upperFirst(camelCase(channelPath)) + upperFirst(camelCase(name));
                const parameterSchemaObject = {
                    ...parameter,
                    type: "string" as OpenAPIV3.NonArraySchemaObjectType,
                    title: parameterName,
                    example: parameter.examples?.[0],
                    default: parameter.default,
                    enum: parameter.enum,
                    required: undefined
                };
                let parameterSchema: SchemaWithExample = convertSchema(
                    parameterSchemaObject,
                    false,
                    context,
                    [parameterKey],
                    source,
                    context.namespace
                );
                if (isOptional) {
                    parameterSchema = SchemaWithExample.optional({
                        value: parameterSchema,
                        description: undefined,
                        availability: undefined,
                        generatedName: "",
                        title: parameterName,
                        groupName: undefined,
                        nameOverride: undefined,
                        inline: undefined
                    });
                }
                const parameterObject = {
                    name: parameterKey,
                    description: parameter.description,
                    parameterNameOverride: undefined,
                    schema: parameterSchema,
                    variableReference: undefined,
                    availability: convertAvailability(parameter),
                    source
                };

                if (type === "header") {
                    headers.push({
                        ...parameterObject,
                        env: undefined
                    });
                } else if (type === "path") {
                    pathParameters.push(parameterObject);
                } else if (type === "payload") {
                    queryParameters.push(parameterObject);
                }
            }
        }

        if (
            headers.length > 0 ||
            queryParameters.length > 0 ||
            (channelEvents[channelPath] != null &&
                (channelEvents[channelPath].publish != null || channelEvents[channelPath].subscribe != null))
        ) {
            const fernExamples: WebsocketSessionExampleExtension[] = getFernExamples(channel);
            const messages: WebsocketMessageSchema[] = channelEvents[channelPath]?.__parsedMessages ?? [];
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
                const { examplePublishMessage, exampleSubscribeMessage } = getExampleSchemas({
                    messages,
                    messageSchemas: messageSchemas[channelPath] ?? {}
                });
                if (examplePublishMessage != null) {
                    exampleBuilderInputs.push(examplePublishMessage);
                }
                if (exampleSubscribeMessage != null) {
                    exampleBuilderInputs.push(exampleSubscribeMessage);
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

            parsedChannels[channelPath] = {
                audiences: getExtension<string[] | undefined>(channel, FernOpenAPIExtension.AUDIENCES) ?? [],
                handshake: {
                    headers: headers.map((header) => ({
                        ...header,
                        schema: convertSchemaWithExampleToSchema(header.schema),
                        env: header.env
                    })),
                    queryParameters: queryParameters.map((param) => ({
                        ...param,
                        schema: convertSchemaWithExampleToSchema(param.schema)
                    })),
                    pathParameters: pathParameters.map((param) => ({
                        ...param,
                        parameterNameOverride: undefined,
                        schema: convertSchemaWithExampleToSchema(param.schema)
                    }))
                },
                groupName: context.resolveGroupName([
                    getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_SDK_GROUP_NAME) ?? channelPath
                ]),
                messages,
                summary: getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_DISPLAY_NAME),
                servers:
                    channel.servers?.map((serverRef) => getServerNameFromServerRef(servers, serverRef)) ??
                    Object.values(servers),
                // TODO (Eden): This can be a LOT more complicated than this. See the link below for more details:
                // https://www.asyncapi.com/docs/reference/specification/v3.0.0#channelObject
                path: channel.address ?? transformToValidPath(channelPath),
                description: channel.description,
                examples,
                source
            };
        }
    }

    return {
        groupedSchemas: getSchemas(context.namespace, schemas),
        channels: parsedChannels,
        servers: Object.values(servers),
        basePath: getExtension<string | undefined>(document, FernAsyncAPIExtension.BASE_PATH)
    };
}

function getChannelPathFromOperation(operation: AsyncAPIV3.Operation): string {
    if (!operation.channel.$ref.startsWith(CHANNEL_REFERENCE_PREFIX)) {
        throw new Error(`Failed to resolve channel path from operation ${operation.channel.$ref}`);
    }
    return operation.channel.$ref.substring(CHANNEL_REFERENCE_PREFIX.length);
}

function convertChannelParameterLocation(location: string): {
    type: "header" | "path" | "payload";
    parameterKey: string;
} {
    try {
        const [messageType, parameterKey] = location.split("#/");
        if (messageType == null || parameterKey == null) {
            throw new Error(`Invalid location format: ${location}; unable to parse message type and parameter key`);
        }
        if (!messageType.startsWith(LOCATION_PREFIX)) {
            throw new Error(`Invalid location format: ${location}; expected ${LOCATION_PREFIX} prefix`);
        }
        const type = messageType.substring(LOCATION_PREFIX.length);
        if (type !== "header" && type !== "path" && type !== "payload") {
            throw new Error(`Invalid message type: ${type}. Must be one of: header, path, payload`);
        }
        return { type, parameterKey };
    } catch (error) {
        throw new Error(
            `Invalid location format: ${location}; see here for more details: ` +
                "https://www.asyncapi.com/docs/reference/specification/v3.0.0#runtimeExpression"
        );
    }
}

function getServerNameFromServerRef(
    servers: Record<string, ServerContext>,
    serverRef: OpenAPIV3.ReferenceObject
): ServerContext {
    if (!serverRef.$ref.startsWith(SERVER_REFERENCE_PREFIX)) {
        throw new Error(`Failed to resolve server name from server ref ${serverRef.$ref}`);
    }
    const serverName = serverRef.$ref.substring(SERVER_REFERENCE_PREFIX.length);
    const server = servers[serverName];
    if (server == null) {
        throw new Error(`Failed to find server with name ${serverName}`);
    }
    return server;
}

function convertMessageReferencesToWebsocketSchemas({
    messages,
    channelPath,
    origin,
    messageSchemas,
    duplicatedMessageIds,
    context
}: {
    messages: OpenAPIV3.ReferenceObject[];
    channelPath: string;
    origin: "server" | "client";
    messageSchemas: Record<SchemaId, SchemaWithExample>;
    duplicatedMessageIds: Array<SchemaId>;
    context: AsyncAPIV3ParserContext;
}): WebsocketMessageSchema[] {
    const results: WebsocketMessageSchema[] = [];

    messages.forEach((messageRef, i) => {
        const resolvedMessage = context.resolveMessageReference(messageRef);
        let schemaId = resolvedMessage.name as string;

        if (duplicatedMessageIds.includes(schemaId)) {
            schemaId = `${channelPath}_${schemaId}`;
        }

        const schema = messageSchemas[schemaId];
        if (schema != null) {
            results.push({
                origin,
                name: schemaId ?? `${origin}Message${i + 1}`,
                body: convertSchemaWithExampleToSchema(schema)
            });
        }
    });

    return results;
}

function getExampleSchemas({
    messages,
    messageSchemas
}: {
    messages: WebsocketMessageSchema[];
    messageSchemas: Record<SchemaId, SchemaWithExample>;
}): {
    examplePublishMessage: SessionExampleBuilderInput | undefined;
    exampleSubscribeMessage: SessionExampleBuilderInput | undefined;
} {
    const examplePublishMessageId = messages.find((message) => message.origin === "client")?.name;
    const exampleSubscribeMessageId = messages.find((message) => message.origin === "server")?.name;
    const examplePublishMessage = examplePublishMessageId != null ? messageSchemas[examplePublishMessageId] : undefined;
    const exampleSubscribeMessage =
        exampleSubscribeMessageId != null ? messageSchemas[exampleSubscribeMessageId] : undefined;

    return {
        examplePublishMessage:
            examplePublishMessage != null && examplePublishMessageId != null
                ? {
                      type: examplePublishMessageId,
                      payload: examplePublishMessage
                  }
                : undefined,
        exampleSubscribeMessage:
            exampleSubscribeMessage != null && exampleSubscribeMessageId != null
                ? {
                      type: exampleSubscribeMessageId,
                      payload: exampleSubscribeMessage
                  }
                : undefined
    };
}
