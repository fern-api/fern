import {
    HeaderWithExample,
    QueryParameterWithExample,
    Schema,
    SchemaId,
    SchemaWithExample,
    WebsocketChannel,
    WebsocketSessionExample
} from "@fern-api/openapi-ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../schema/convertSchemas";
import { convertUndiscriminatedOneOf } from "../schema/convertUndiscriminatedOneOf";
import { convertSchemaWithExampleToSchema } from "../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../schema/utils/isReferenceObject";
import { AsyncAPIV2ParserContext } from "./AsyncAPIParserContext";
import { ExampleWebsocketSessionFactory } from "./ExampleWebsocketSessionFactory";
import { getFernExamples, WebsocketSessionExampleExtension } from "./getFernExamples";
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

    const schemas: Record<SchemaId, SchemaWithExample> = {};
    let parsedChannel: WebsocketChannel | undefined = undefined;

    for (const [schemaId, schema] of Object.entries(document.components?.schemas ?? {})) {
        const convertedSchema = convertSchema(schema, false, context, [schemaId]);
        schemas[schemaId] = convertedSchema;
    }

    const exampleFactory = new ExampleWebsocketSessionFactory(schemas, taskContext.logger);

    for (const [channelPath, channel] of Object.entries(document.channels ?? {})) {
        if (channel.bindings?.ws == null) {
            context.logger.error(`Channel ${channelPath} does not have websocket bindings. Skipping.`);
            continue;
        }

        const headers: HeaderWithExample[] = [];
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

        const queryParameters: QueryParameterWithExample[] = [];
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
                breadcrumbs,
                context
            });
        }

        let subscribeSchema: SchemaWithExample | undefined = undefined;
        if (channel.subscribe != null) {
            subscribeSchema = convertMessageToSchema({
                generatedName: channel.subscribe.operationId ?? "SubscribeEvent",
                event: channel.subscribe,
                breadcrumbs,
                context
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
                    subscribe: subscribeSchema
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

            const tag = document.tags?.[0];
            parsedChannel = {
                handshake: {
                    headers: headers.map((header) => {
                        return {
                            ...header,
                            schema: convertSchemaWithExampleToSchema(header.schema)
                        };
                    }),
                    queryParameters: queryParameters.map((param) => {
                        return {
                            ...param,
                            schema: convertSchemaWithExampleToSchema(param.schema)
                        };
                    })
                },
                groupName: tag?.name != null ? [tag.name] : ["Websocket"],
                publish: publishSchema != null ? convertSchemaWithExampleToSchema(publishSchema) : publishSchema,
                subscribe:
                    subscribeSchema != null ? convertSchemaWithExampleToSchema(subscribeSchema) : subscribeSchema,
                summary: undefined,
                path: channelPath,
                description: undefined,
                examples
            };
            break;
        }
    }

    return {
        schemas: Object.fromEntries(
            Object.entries(schemas).map(([id, schema]) => [id, convertSchemaWithExampleToSchema(schema)])
        ),
        channel: parsedChannel
    };
}

function convertMessageToSchema({
    generatedName,
    event,
    context,
    breadcrumbs
}: {
    breadcrumbs: string[];
    generatedName: string;
    event: AsyncAPIV2.PublishEvent | AsyncAPIV2.SubscribeEvent;
    context: AsyncAPIV2ParserContext;
}): SchemaWithExample | undefined {
    if (event.message.oneOf != null) {
        const subtypes: (OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject)[] = [];
        for (const schema of event.message.oneOf) {
            let resolvedSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
            if (isReferenceObject(schema)) {
                resolvedSchema = context.resolveMessageReference(schema).payload;
            } else {
                resolvedSchema = schema;
            }
            subtypes.push(resolvedSchema);
        }
        return convertUndiscriminatedOneOf({
            description: event.description ?? event.message.description,
            subtypes,
            nameOverride: event.operationId,
            generatedName,
            groupName: undefined,
            wrapAsNullable: false,
            breadcrumbs,
            context
        });
    }
    return undefined;
}
