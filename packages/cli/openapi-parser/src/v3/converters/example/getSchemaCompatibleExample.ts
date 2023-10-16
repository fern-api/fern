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
    if (schema.type === "optional" || schema.type === "nullable") {
        return schema.value.type === "primitive" && schema.value.schema.type === "boolean";
    }
    return schema.type === "primitive" && schema.schema.type === "boolean";
}

function isSchemaString({ schema }: { schema: Schema }) {
    if (schema.type === "optional" || schema.type === "nullable") {
        return schema.value.type === "primitive" && schema.value.schema.type === "string";
    }
    return schema.type === "primitive" && schema.schema.type === "string";
}

function isSchemaDatetime({ schema }: { schema: Schema }) {
    if (schema.type === "optional" || schema.type === "nullable") {
        return schema.value.type === "primitive" && schema.value.schema.type === "datetime";
    }
    return schema.type === "primitive" && schema.schema.type === "datetime";
}

function isSchemaEnum({ schema }: { schema: Schema }) {
    if (schema.type === "optional" || schema.type === "nullable") {
        return schema.value.type === "enum";
    }
    return schema.type === "enum";
}
