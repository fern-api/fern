import { camelCase, upperFirst } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";

import {
    HeaderWithExample,
    PathParameterWithExample,
    PrimitiveSchemaValueWithExample,
    QueryParameterWithExample,
    SchemaId,
    SchemaWithExample,
    Source,
    WebsocketChannel,
    WebsocketSessionExample
} from "@fern-api/openapi-ir";

import { FernOpenAPIExtension } from "../..";
import { getExtension } from "../../getExtension";
import { convertAvailability } from "../../schema/convertAvailability";
import { convertEnum } from "../../schema/convertEnum";
import { convertSchema } from "../../schema/convertSchemas";
import { constructUndiscriminatedOneOf } from "../../schema/convertUndiscriminatedOneOf";
import { convertSchemaWithExampleToSchema } from "../../schema/utils/convertSchemaWithExampleToSchema";
import { getSchemas } from "../../utils/getSchemas";
import { ExampleWebsocketSessionFactory } from "../ExampleWebsocketSessionFactory";
import { FernAsyncAPIExtension } from "../fernExtensions";
import { ParseAsyncAPIOptions } from "../options";
import { AsyncAPIIntermediateRepresentation } from "../parse";
import { ChannelId, ServerContext } from "../sharedTypes";
import { constructServerUrl, transformToValidPath } from "../sharedUtils";
import { AsyncAPIV3 } from "../v3";
import { AsyncAPIV3ParserContext } from "./AsyncAPIV3ParserContext";

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
                if (message && message.payload != null) {
                    if (!seenMessages[messageId]) {
                        seenMessages[messageId] = [];
                    }
                    seenMessages[messageId].push({
                        channelId,
                        payload: message.payload
                    });
                }
            }
        }
    }

    for (const [originalMessageId, occurrences] of Object.entries(seenMessages)) {
        if (occurrences.length === 1) {
            const occurence = occurrences[0] as SeenMessage;
            const occurenceChannelId = occurence.channelId as ChannelId;
            messageSchemas[occurenceChannelId] = messageSchemas[occurenceChannelId] || {};
            messageSchemas[occurenceChannelId][originalMessageId] = convertSchema(
                occurence.payload,
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

    const channelEvents: Record<
        string,
        { subscribe: OpenAPIV3.ReferenceObject[]; publish: OpenAPIV3.ReferenceObject[] }
    > = {};
    for (const [operationId, operation] of Object.entries(document.operations ?? {})) {
        if (getExtension<boolean>(operation, FernAsyncAPIExtension.IGNORE)) {
            continue;
        }

        const channelPath = getChannelPathFromOperation(operation);

        if (!channelEvents[channelPath]) {
            channelEvents[channelPath] = { subscribe: [], publish: [] };
        }

        if (operation.action === "receive") {
            channelEvents[channelPath].subscribe.push(...operation.messages);
        } else if (operation.action === "send") {
            channelEvents[channelPath].publish.push(...operation.messages);
        } else {
            throw new Error(`Operation ${operationId} has an invalid action: ${operation.action}`);
        }
    }

    const channelSchemas: Record<
        string,
        { subscribe: SchemaWithExample | undefined; publish: SchemaWithExample | undefined }
    > = {};
    for (const [path, events] of Object.entries(channelEvents)) {
        channelSchemas[path] = { subscribe: undefined, publish: undefined };
        const channelName = path.split("/").pop() ?? path;
        const channelPrefix = channelName.charAt(0).toUpperCase() + channelName.slice(1);

        if (events.subscribe.length > 0 && messageSchemas[path] != null) {
            channelSchemas[path].subscribe = convertMessagesToSchema({
                generatedName: channelPrefix + "SubscribeEvent",
                channelPath: path,
                messages: events.subscribe,
                breadcrumbs,
                context,
                source,
                messageSchemas: messageSchemas[path],
                duplicatedMessageIds
            });
        }
        if (events.publish.length > 0 && messageSchemas[path] != null) {
            channelSchemas[path].publish = convertMessagesToSchema({
                generatedName: channelPrefix + "PublishEvent",
                channelPath: path,
                messages: events.publish,
                breadcrumbs,
                context,
                source,
                messageSchemas: messageSchemas[path],
                duplicatedMessageIds
            });
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
                let parameterSchema: SchemaWithExample =
                    parameter.enum != null && Array.isArray(parameter.enum)
                        ? buildEnumSchema({
                              parameterName,
                              parameterDescription: parameter.description,
                              enumValues: parameter.enum,
                              defaultValue: parameter.default,
                              context,
                              source
                          })
                        : SchemaWithExample.primitive({
                              schema: PrimitiveSchemaValueWithExample.string({
                                  default: parameter.default,
                                  pattern: undefined,
                                  format: undefined,
                                  maxLength: undefined,
                                  minLength: undefined,
                                  example: parameter.examples?.[0]
                              }),
                              description: undefined,
                              availability: undefined,
                              generatedName: "",
                              title: parameterName,
                              groupName: undefined,
                              nameOverride: undefined
                          });
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
            (channelSchemas[channelPath] != null &&
                (channelSchemas[channelPath].publish != null || channelSchemas[channelPath].subscribe != null))
        ) {
            const examples: WebsocketSessionExample[] = [];
            const autogenExample = exampleFactory.buildWebsocketSessionExample({
                handshake: {
                    headers,
                    queryParameters
                },
                publish: channelSchemas[channelPath]?.publish,
                subscribe: channelSchemas[channelPath]?.subscribe
            });
            if (autogenExample != null) {
                examples.push(autogenExample);
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
                groupName: [
                    getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_SDK_GROUP_NAME) ?? channelPath
                ],
                publish:
                    channelSchemas[channelPath]?.publish != null
                        ? convertSchemaWithExampleToSchema(channelSchemas[channelPath].publish)
                        : undefined,
                subscribe:
                    channelSchemas[channelPath]?.subscribe != null
                        ? convertSchemaWithExampleToSchema(channelSchemas[channelPath].subscribe)
                        : undefined,
                summary: getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_DISPLAY_NAME),
                servers:
                    channel.servers?.map((serverRef) => getServerNameFromServerRef(servers, serverRef)) ??
                    Object.values(servers),
                // TODO (Eden): This can be a LOT more complicated than this. See the link below for more details:
                // https://www.asyncapi.com/docs/reference/specification/v3.0.0#channelObject
                path: channel.address ?? transformToValidPath(channelPath),
                description: undefined,
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
    const [messageType, parameterKey] = location.split("#/");
    if (messageType == null || parameterKey == null) {
        throw new Error(`Invalid location format: ${location}`);
    }
    if (!messageType.startsWith(LOCATION_PREFIX)) {
        throw new Error(`Invalid location format: ${location}`);
    }
    const type = messageType.substring(LOCATION_PREFIX.length);
    if (type !== "header" && type !== "path" && type !== "payload") {
        throw new Error(`Invalid message type: ${type}. Must be one of: header, path, payload`);
    }
    return { type, parameterKey };
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

function buildEnumSchema({
    parameterName,
    parameterDescription,
    enumValues,
    defaultValue,
    context,
    source
}: {
    parameterName: string;
    parameterDescription: string | undefined;
    enumValues: string[];
    defaultValue: string | undefined;
    context: AsyncAPIV3ParserContext;
    source: Source;
}): SchemaWithExample {
    return convertEnum({
        nameOverride: undefined,
        generatedName: parameterName,
        title: undefined,
        wrapAsNullable: false,
        description: parameterDescription ?? undefined,
        availability: undefined,
        fernEnum: {},
        enumVarNames: undefined,
        enumValues,
        _default: defaultValue,
        groupName: undefined,
        context,
        source,
        inline: undefined
    });
}

function convertMessagesToSchema({
    generatedName,
    channelPath,
    messages,
    context,
    breadcrumbs,
    source,
    messageSchemas,
    duplicatedMessageIds
}: {
    breadcrumbs: string[];
    generatedName: string;
    channelPath: string;
    messages: OpenAPIV3.ReferenceObject[];
    context: AsyncAPIV3ParserContext;
    source: Source;
    messageSchemas: Record<SchemaId, SchemaWithExample>;
    duplicatedMessageIds: Array<SchemaId>;
}): SchemaWithExample | undefined {
    if (messages.length > 0) {
        const subtypes: SchemaWithExample[] = [];
        for (const message of messages) {
            const resolvedMessage = context.resolveMessageReference(message);
            let schemaId: string;
            if (duplicatedMessageIds.some((duplicatedMessageId) => duplicatedMessageId === resolvedMessage.name)) {
                schemaId = `${channelPath}_${resolvedMessage.name}`;
            } else {
                schemaId = resolvedMessage.name as string;
            }
            const schema = messageSchemas[schemaId];
            if (schema != null) {
                subtypes.push(schema);
            }
        }
        return constructUndiscriminatedOneOf({
            description: undefined,
            availability: undefined,
            subtypes,
            nameOverride: undefined,
            generatedName,
            title: undefined,
            groupName: undefined,
            wrapAsNullable: false,
            breadcrumbs,
            context,
            encoding: undefined,
            source,
            namespace: context.namespace,
            subtypePrefixOverrides: []
        });
    }
    return undefined;
}
