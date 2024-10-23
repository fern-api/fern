import { HttpEndpointSchema } from "../schemas";
import {
    ExampleBodyResponseSchema,
    ExampleResponseSchema,
    ExampleSseResponseSchema,
    ExampleStreamResponseSchema
} from "../schemas";
import { isSimpleStreamResponseSchema } from "./isSimpleStreamResponseSchema";
import { isSseStsreamResponseSchema } from "./isSseStreamResponseSchema";

export interface ExampleResponseSchemaVisitor<T> {
    body: (example: ExampleBodyResponseSchema) => T;
    stream: (example: ExampleStreamResponseSchema) => T;
    events: (example: ExampleSseResponseSchema) => T;
}

export function visitExampleResponseSchema<T>(
    endpoint: HttpEndpointSchema,
    example: ExampleResponseSchema,
    visitor: ExampleResponseSchemaVisitor<T>
): T {
    if (isExampleStreamResponseSchema(endpoint, example)) {
        return visitor.stream(example);
    } else if (isExampleSseResponseSchema(endpoint, example)) {
        return visitor.events(example);
    } else {
        return visitor.body(example);
    }
}

export function isExampleStreamResponseSchema(
    endpoint: HttpEndpointSchema,
    example: ExampleResponseSchema
): example is ExampleStreamResponseSchema {
    return (example as ExampleStreamResponseSchema).stream !== undefined && isSimpleStreamResponseSchema(endpoint);
}

export function isExampleSseResponseSchema(
    endpoint: HttpEndpointSchema,
    example: ExampleResponseSchema
): example is ExampleSseResponseSchema {
    return (example as ExampleSseResponseSchema).stream !== undefined && isSseStsreamResponseSchema(endpoint);
}
