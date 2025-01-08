import { Logger } from "@fern-api/logger";
import {
    HeaderExample,
    QueryParameterExample,
    SchemaWithExample,
    Source,
    WebsocketHandshakeWithExample,
    WebsocketMessageExample,
    WebsocketSessionExample
} from "@fern-api/openapi-ir";

import { isExamplePrimitive } from "../openapi/v3/converters/ExampleEndpointFactory";
import { convertSchema } from "../schema/convertSchemas";
import { ExampleTypeFactory } from "../schema/examples/ExampleTypeFactory";
import { isReferenceObject } from "../schema/utils/isReferenceObject";
import { isSchemaRequired } from "../schema/utils/isSchemaRequired";
import { AsyncAPIV2ParserContext } from "./AsyncAPIParserContext";
import { WebsocketSessionExampleExtension } from "./getFernExamples";

export class ExampleWebsocketSessionFactory {
    private exampleTypeFactory: ExampleTypeFactory;
    private schemas: Record<string, SchemaWithExample>;

    constructor(schemas: Record<string, SchemaWithExample>, context: AsyncAPIV2ParserContext) {
        this.exampleTypeFactory = new ExampleTypeFactory(schemas, new Set(), context);
        this.schemas = schemas;
    }

    public buildWebsocketSessionExamplesForExtension({
        context,
        extensionExamples,
        publish,
        subscribe,
        handshake,
        source,
        namespace
    }: {
        context: AsyncAPIV2ParserContext;
        extensionExamples: WebsocketSessionExampleExtension[];
        handshake: WebsocketHandshakeWithExample;
        publish: SchemaWithExample | undefined;
        subscribe: SchemaWithExample | undefined;
        source: Source;
        namespace: string | undefined;
    }): WebsocketSessionExample[] {
        const result: WebsocketSessionExample[] = [];

        for (const extensionExample of extensionExamples) {
            const queryParameters: QueryParameterExample[] = [];

            for (const queryParameter of handshake.queryParameters) {
                const required = this.isSchemaRequired(queryParameter.schema);
                let example = this.exampleTypeFactory.buildExample({
                    schema: queryParameter.schema,
                    exampleId: undefined,
                    example: extensionExample.queryParameters?.[queryParameter.name],
                    options: {
                        name: queryParameter.name,
                        isParameter: true,
                        ignoreOptionals: true
                    }
                });
                if (example != null && !isExamplePrimitive(example)) {
                    example = undefined;
                }
                if (required && example == null) {
                    continue;
                } else if (example != null) {
                    queryParameters.push({
                        name: queryParameter.name,
                        value: example
                    });
                }
            }

            const headers: HeaderExample[] = [];
            for (const header of handshake.headers) {
                const required = this.isSchemaRequired(header.schema);
                let example = this.exampleTypeFactory.buildExample({
                    schema: header.schema,
                    exampleId: undefined,
                    example: extensionExample.headers?.[header.name],
                    options: {
                        name: header.name,
                        isParameter: true,
                        ignoreOptionals: true
                    }
                });
                if (example != null && !isExamplePrimitive(example)) {
                    example = undefined;
                }
                if (required && example == null) {
                    continue;
                } else if (example != null) {
                    headers.push({
                        name: header.name,
                        value: example
                    });
                }
            }

            const messages: WebsocketMessageExample[] = [];
            for (const messageExample of extensionExample.messages) {
                const messageSchema = context.resolveMessageReference({
                    $ref: `#/components/messages/${messageExample.messageId}`
                });
                const resolvedSchema = isReferenceObject(messageSchema.payload)
                    ? context.resolveSchemaReference(messageSchema.payload)
                    : messageSchema.payload;
                const example = this.exampleTypeFactory.buildExample({
                    schema: convertSchema(
                        resolvedSchema,
                        false,
                        context,
                        [messageExample.messageId],
                        source,
                        namespace
                    ),
                    exampleId: undefined,
                    example: messageExample.value,
                    options: {
                        isParameter: false,
                        ignoreOptionals: true
                    }
                });
                if (example != null) {
                    messages.push({
                        messageType: messageExample.type,
                        payload: example,
                        description: undefined
                    });
                }
            }

            result.push({
                name: extensionExample.summary,
                queryParameters,
                headers,
                description: extensionExample.description,
                messages
            });
        }

        return result;
    }

    public buildWebsocketSessionExample({
        publish,
        subscribe,
        handshake
    }: {
        handshake: WebsocketHandshakeWithExample;
        publish: SchemaWithExample | undefined;
        subscribe: SchemaWithExample | undefined;
    }): WebsocketSessionExample | undefined {
        const example: WebsocketSessionExample = {
            name: undefined,
            queryParameters: [],
            headers: [],
            description: undefined,
            messages: []
        };

        const queryParameters: QueryParameterExample[] = [];
        for (const queryParameter of handshake.queryParameters) {
            const required = this.isSchemaRequired(queryParameter.schema);
            let example = this.exampleTypeFactory.buildExample({
                schema: queryParameter.schema,
                exampleId: undefined,
                example: undefined,
                options: {
                    name: queryParameter.name,
                    isParameter: true,
                    ignoreOptionals: true
                }
            });
            if (example != null && !isExamplePrimitive(example)) {
                example = undefined;
            }
            if (required && example == null) {
                return undefined;
            } else if (example != null) {
                queryParameters.push({
                    name: queryParameter.name,
                    value: example
                });
            }
        }

        const headers: HeaderExample[] = [];
        for (const header of handshake.headers) {
            const required = this.isSchemaRequired(header.schema);
            let example = this.exampleTypeFactory.buildExample({
                schema: header.schema,
                exampleId: undefined,
                example: undefined,
                options: {
                    name: header.name,
                    isParameter: true,
                    ignoreOptionals: true
                }
            });
            if (example != null && !isExamplePrimitive(example)) {
                example = undefined;
            }
            if (required && example == null) {
                return undefined;
            } else if (example != null) {
                headers.push({
                    name: header.name,
                    value: example
                });
            }
        }

        if (publish != null) {
            const publishMessageExample = this.exampleTypeFactory.buildExample({
                schema: publish,
                exampleId: undefined,
                example: undefined,
                options: {
                    isParameter: false,
                    ignoreOptionals: true
                }
            });
            if (publishMessageExample != null) {
                example.messages.push({
                    messageType: "publish",
                    payload: publishMessageExample,
                    description: undefined
                });
            }
        }

        if (subscribe != null) {
            const publishMessageExample = this.exampleTypeFactory.buildExample({
                schema: subscribe,
                exampleId: undefined,
                example: undefined,
                options: {
                    isParameter: false,
                    ignoreOptionals: true
                }
            });
            if (publishMessageExample != null) {
                example.messages.push({
                    messageType: "subscribe",
                    payload: publishMessageExample,
                    description: undefined
                });
            }
        }

        return example;
    }

    private isSchemaRequired(schema: SchemaWithExample) {
        return isSchemaRequired(this.getResolvedSchema(schema));
    }

    private getResolvedSchema(schema: SchemaWithExample) {
        while (schema.type === "reference") {
            const resolvedSchema = this.schemas[schema.schema];
            if (resolvedSchema == null) {
                throw new Error(`Unexpected error: Failed to resolve schema reference: ${schema.schema}`);
            }
            schema = resolvedSchema;
        }
        return schema;
    }
}
