import {
    ExampleBodyResponseSchema,
    ExampleResponseSchema,
    ExampleSseResponseSchema,
    ExampleStreamResponseSchema
} from "../schemas/ExampleResponseSchema";

export interface ExampleResponseSchemaVisitor<T> {
    body: (example: ExampleBodyResponseSchema) => T;
    stream: (example: ExampleStreamResponseSchema) => T;
    events: (example: ExampleSseResponseSchema) => T;
}

export function visitExampleResponseSchema<T>(
    example: ExampleResponseSchema,
    visitor: ExampleResponseSchemaVisitor<T>
): T {
    if (isExampleStreamResponseSchema(example)) {
        return visitor.stream(example);
    } else if (isExampleSseResponseSchema(example)) {
        return visitor.events(example);
    } else {
        return visitor.body(example);
    }
}

export function isExampleStreamResponseSchema(example: ExampleResponseSchema): example is ExampleStreamResponseSchema {
    return (example as ExampleStreamResponseSchema).stream !== undefined;
}

export function isExampleSseResponseSchema(example: ExampleResponseSchema): example is ExampleSseResponseSchema {
    return (example as ExampleSseResponseSchema).events !== undefined;
}
