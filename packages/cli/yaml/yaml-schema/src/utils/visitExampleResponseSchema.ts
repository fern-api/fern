import { assertNever } from "@fern-api/core-utils";
import {
    ExampleBodyResponseSchema,
    ExampleResponseSchema,
    ExampleSseResponseSchema,
    ExampleStreamResponseSchema
} from "../schemas/ExampleResponseSchema";
import { HttpEndpointSchema } from "../schemas/HttpEndpointSchema";

export interface ExampleResponseSchemaVisitor<T> {
    body: (example: ExampleBodyResponseSchema) => T;
    stream: (example: ExampleStreamResponseSchema) => T;
    events: (example: ExampleSseResponseSchema) => T;
}

export function visitExampleResponseSchema<T>({
    endpoint,
    example,
    visitor
}: {
    endpoint: HttpEndpointSchema;
    example: ExampleResponseSchema;
    visitor: ExampleResponseSchemaVisitor<T>;
}): T {
    if ("stream" in example) {
        return visitor.stream(example);
    } else if ("events" in example) {
        return visitor.events(example);
    } else if ("batch" in example) {
        return visitor.body(example);
    } else {
        assertNever(example as never);
    }
}
