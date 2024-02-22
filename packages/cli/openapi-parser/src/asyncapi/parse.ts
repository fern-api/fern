import {
    Header,
    OneOfSchemaWithExample,
    QueryParameter,
    Schema,
    SchemaId,
    SchemaWithExample,
    WebsocketChannel
} from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { convertSchema } from "../schema/convertSchemas";
import { isReferenceObject } from "../schema/utils/isReferenceObject";
import { AsyncAPIV2ParserContext } from "./AsyncAPIParserContext";
import { AsyncAPIV2 } from "./v2";

export interface AsyncAPIIntermediateRepresentation {
    schemas: Record<SchemaId, Schema>;
    channel: WebsocketChannel | undefined;
}

export function parseAsyncAPI({
    document,
    taskContext
}: {
    document: AsyncAPIV2.Document;
    taskContext: TaskContext;
}): AsyncAPIIntermediateRepresentation {
    const breadcrumbs: string[] = [];
    if (document.tags?.[0] != null) {
        breadcrumbs.push(document.tags[0].name);
    } else {
        breadcrumbs.push("websocket");
    }

    const context = new AsyncAPIV2ParserContext({ document, taskContext });

    const schemas: Record<SchemaId, Schema> = {};
    let parsedChannel: WebsocketChannel | undefined = undefined;

    for (const [channelPath, channel] of Object.entries(document.channels ?? {})) {
        if (channel.bindings?.ws == null) {
            context.logger.error(`Channel ${channelPath} does not have websocket bindings. Skipping.`);
            continue;
        }

        const headers: Header[] = [];
        if (channel.bindings.ws.headers != null) {
            const required = channel.bindings.ws.headers.required ?? [];
            for (const [name, schema] of Object.entries(channel.bindings.ws.headers.properties ?? {})) {
                const resolvedHeader = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;
                headers.push({
                    name,
                    schema: convertSchema(resolvedHeader, !required.includes(name), context, breadcrumbs),
                    description: resolvedHeader.description,
                    parameterNameOverride: undefined
                });
            }
        }

        const queryParameters: QueryParameter[] = [];
        if (channel.bindings.ws.query != null) {
            const required = channel.bindings.ws.query.required ?? [];
            for (const [name, schema] of Object.entries(channel.bindings.ws.query.properties ?? {})) {
                const resolvedQueryParameter = isReferenceObject(schema)
                    ? context.resolveSchemaReference(schema)
                    : schema;
                queryParameters.push({
                    name,
                    schema: convertSchema(resolvedQueryParameter, !required.includes(name), context, breadcrumbs),
                    description: resolvedQueryParameter.description,
                    parameterNameOverride: undefined
                });
            }
        }

        let publishSchema: SchemaWithExample | undefined = undefined;
        if (channel.publish != null) {
            publishSchema = convertMessageToSchema({
                generatedName: channel.publish.operationId ?? "PublishEvent",
                event: channel.publish,
                context
            });
        }

        let subscribeSchema: SchemaWithExample | undefined = undefined;
        if (channel.subscribe != null) {
            subscribeSchema = convertMessageToSchema({
                generatedName: channel.subscribe.operationId ?? "SubscribeEvent",
                event: channel.subscribe,
                context
            });
        }

        if (headers.length > 0 || queryParameters.length > 0 || publishSchema != null || subscribeSchema != null) {
            const tag = document.tags?.[0];
            parsedChannel = {
                handshake: {
                    headers,
                    queryParameters
                },
                groupName: tag?.name != null ? [tag.name] : ["Websocket"],
                publish: publishSchema,
                subscribe: subscribeSchema,
                summary: undefined,
                path: channelPath,
                description: undefined
            };
            break;
        }
    }

    for (const [schemaId, schema] of Object.entries(document.components?.schemas ?? {})) {
        const convertedSchema = convertSchema(schema, true, context, []);
        schemas[schemaId] = convertedSchema;
    }

    return {
        schemas,
        channel: parsedChannel
    };
}

function convertMessageToSchema({
    generatedName,
    event,
    context
}: {
    generatedName: string;
    event: AsyncAPIV2.PublishEvent | AsyncAPIV2.SubscribeEvent;
    context: AsyncAPIV2ParserContext;
}): SchemaWithExample | undefined {
    if (event.message.oneOf != null) {
        const subtypes: SchemaWithExample[] = [];
        for (const schema of event.message.oneOf) {
            let resolvedSchema;
            if (isReferenceObject(schema)) {
                const messageValue = context.resolveMessageReference(schema);
                resolvedSchema = convertSchema(messageValue.payload, true, context, []);
            } else {
                resolvedSchema = convertSchema(schema, true, context, []);
            }
            if (resolvedSchema != null) {
                subtypes.push(resolvedSchema);
            }
        }
        return SchemaWithExample.oneOf(
            OneOfSchemaWithExample.undisciminated({
                description: event.description ?? event.message.description,
                schemas: subtypes,
                nameOverride: undefined,
                generatedName: event.operationId ?? generatedName,
                groupName: undefined
            })
        );
    }
    return undefined;
}
