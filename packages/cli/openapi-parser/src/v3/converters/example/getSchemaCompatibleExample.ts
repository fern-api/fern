import { FullExample, PrimitiveExample } from "@fern-fern/openapi-ir-model/example";
import { Schema } from "@fern-fern/openapi-ir-model/ir";

export function getSchemaCompatiableExample({
    schema,
    example,
}: {
    schema: Schema;
    example: unknown;
}): FullExample | undefined {
    if (isSchemaString({ schema }) && typeof example === "string") {
        return FullExample.primitive(PrimitiveExample.string(example));
    }
    if (isSchemaBoolean({ schema }) && typeof example === "boolean") {
        return FullExample.primitive(PrimitiveExample.boolean(example));
    }
    if (isSchemaDatetime({ schema }) && typeof example === "string") {
        return FullExample.primitive(PrimitiveExample.datetime(example));
    }
    if (isSchemaDatetime({ schema }) && typeof example === "string") {
        return FullExample.primitive(PrimitiveExample.datetime(example));
    }
    if (isSchemaEnum({ schema }) && typeof example === "string") {
        return FullExample.enum(example);
    }

    return undefined;
}

function isSchemaBoolean({ schema }: { schema: Schema }) {
    const unwrappedSchema = unwrapOptionalOrNullable(schema);
    return unwrappedSchema.type === "primitive" && unwrappedSchema.schema.type === "boolean";
}

function isSchemaString({ schema }: { schema: Schema }) {
    const unwrappedSchema = unwrapOptionalOrNullable(schema);
    return unwrappedSchema.type === "primitive" && unwrappedSchema.schema.type === "string";
}

function isSchemaDatetime({ schema }: { schema: Schema }) {
    const unwrappedSchema = unwrapOptionalOrNullable(schema);
    return unwrappedSchema.type === "primitive" && unwrappedSchema.schema.type === "datetime";
}

function isSchemaEnum({ schema }: { schema: Schema }) {
    const unwrappedSchema = unwrapOptionalOrNullable(schema);
    return unwrappedSchema.type === "enum";
}

function unwrapOptionalOrNullable(schema: Schema): Schema {
    if (schema.type === "nullable") {
        return unwrapOptionalOrNullable(schema.value);
    }
    if (schema.type === "optional") {
        return unwrapOptionalOrNullable(schema.value);
    }
    return schema;
}
