import {
    HeaderExample,
    QueryParameterExample,
    SchemaWithExample,
    Source,
    WebsocketHandshakeWithExample,
    WebsocketMessageExample,
    WebsocketSessionExample
} from "@fern-api/openapi-ir";

import { isExamplePrimitive } from "../../openapi/v3/converters/ExampleEndpointFactory";
import { convertSchema } from "../../schema/convertSchemas";
import { isReferenceObject } from "../../schema/utils/isReferenceObject";
import { AbstractExampleWebsocketSessionFactory } from "../AbstractExampleWebsocketSessionFactory";
import { WebsocketSessionExampleExtension } from "../getFernExamples";
import { AsyncAPIV3ParserContext } from "../v3/AsyncAPIV3ParserContext";

const CHANNELS_PATH_PART = "#/channels/";

export class V3ExampleWebsocketSessionFactory extends AbstractExampleWebsocketSessionFactory {
    public buildWebsocketSessionExamplesForExtension({
        context,
        extensionExamples,
        publish,
        subscribe,
        handshake,
        source,
        namespace
    }: {
        context: AsyncAPIV3ParserContext;
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
                    $ref: `#/channels/${messageExample.channelId}/messages/${messageExample.messageId}`
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
}
