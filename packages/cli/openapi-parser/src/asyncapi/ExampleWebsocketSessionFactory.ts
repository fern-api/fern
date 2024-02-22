import { Logger } from "@fern-api/logger";
import {
    HeaderExample,
    QueryParameterExample,
    SchemaWithExample,
    WebsocketHandshakeWithExample,
    WebsocketSessionExample
} from "@fern-api/openapi-ir-sdk";
import { isExamplePrimitive } from "../openapi/v3/converters/ExampleEndpointFactory";
import { ExampleTypeFactory } from "../schema/examples/ExampleTypeFactory";
import { isSchemaRequired } from "../schema/utils/isSchemaRequired";

export class ExampleWebsocketSessionFactory {
    private exampleTypeFactory: ExampleTypeFactory;
    private schemas: Record<string, SchemaWithExample>;

    constructor(schemas: Record<string, SchemaWithExample>, logger: Logger) {
        this.exampleTypeFactory = new ExampleTypeFactory(schemas);
        this.schemas = schemas;
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
