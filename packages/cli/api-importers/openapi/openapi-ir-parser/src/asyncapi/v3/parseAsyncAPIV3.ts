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
    WebsocketChannel
} from "@fern-api/openapi-ir";

import { FernOpenAPIExtension, ParseOpenAPIOptions } from "../..";
import { getExtension } from "../../getExtension";
import { convertAvailability } from "../../schema/convertAvailability";
import { convertEnum } from "../../schema/convertEnum";
import { convertSchema } from "../../schema/convertSchemas";
import { constructUndiscriminatedOneOf } from "../../schema/convertUndiscriminatedOneOf";
import { convertSchemaWithExampleToSchema } from "../../schema/utils/convertSchemaWithExampleToSchema";
import { getSchemas } from "../../utils/getSchemas";
import { FernAsyncAPIExtension } from "../fernExtensions";
import { ParseAsyncAPIOptions } from "../options";
import { AsyncAPIIntermediateRepresentation } from "../parse";
import { AsyncAPIV3 } from "../v3";
import { AsyncAPIV3ParserContext } from "./AsyncAPIV3ParserContext";

const CHANNEL_REFERENCE_PREFIX = "#/channels/";
const LOCATION_PREFIX = "$message.";

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
    const messageSchemas: Record<string, Record<SchemaId, SchemaWithExample>> = {};
    const parsedChannels: Record<string, WebsocketChannel> = {};

    for (const [schemaId, schema] of Object.entries(document.components?.schemas ?? {})) {
        schemas[schemaId] = convertSchema(schema, false, context, [schemaId], source, context.namespace);
    }

    for (const [channelId, channel] of Object.entries(document.channels ?? {})) {
        if (channel.messages != null) {
            messageSchemas[channelId] = {};
            for (const [messageId, message] of Object.entries(channel.messages)) {
                const schemaId = `${channelId}_${messageId}`;
                if (message.payload != null) {
                    messageSchemas[channelId][schemaId] = convertSchema(
                        message.payload,
                        false,
                        context,
                        [schemaId],
                        source,
                        context.namespace
                    );
                }
            }
        }
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
                options: context.options,
                asyncApiOptions,
                messageSchemas: messageSchemas[path]
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
                options: context.options,
                asyncApiOptions,
                messageSchemas: messageSchemas[path]
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
                const parameterName = upperFirst(camelCase(channelPath)) + upperFirst(camelCase(name));
                const parameterSchema =
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
                groupName: [channelPath],
                publish:
                    channelSchemas[channelPath]?.publish != null
                        ? convertSchemaWithExampleToSchema(channelSchemas[channelPath].publish)
                        : undefined,
                subscribe:
                    channelSchemas[channelPath]?.subscribe != null
                        ? convertSchemaWithExampleToSchema(channelSchemas[channelPath].subscribe)
                        : undefined,
                summary: getExtension<string | undefined>(channel, FernAsyncAPIExtension.FERN_DISPLAY_NAME),
                // TODO (Eden): This can be a LOT more complicated than this. See the link below for more details:
                // https://www.asyncapi.com/docs/reference/specification/v3.0.0#channelObject
                path: channel.address ?? transformToValidPath(channelPath),
                description: undefined,
                examples: [],
                source
            };
        }
    }

    return {
        groupedSchemas: getSchemas(context.namespace, schemas),
        channels: parsedChannels,
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

function transformToValidPath(path: string): string {
    if (!path.startsWith("/")) {
        return "/" + path;
    }
    return path;
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
    options,
    asyncApiOptions,
    messageSchemas
}: {
    breadcrumbs: string[];
    generatedName: string;
    channelPath: string;
    messages: OpenAPIV3.ReferenceObject[];
    context: AsyncAPIV3ParserContext;
    source: Source;
    options: ParseOpenAPIOptions;
    asyncApiOptions: ParseAsyncAPIOptions;
    messageSchemas: Record<SchemaId, SchemaWithExample>;
}): SchemaWithExample | undefined {
    if (messages.length > 0) {
        const subtypes: SchemaWithExample[] = [];
        for (const message of messages) {
            const resolvedMessage = context.resolveMessageReference(message);
            const schemaId = `${channelPath}_${resolvedMessage.name}`;
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
