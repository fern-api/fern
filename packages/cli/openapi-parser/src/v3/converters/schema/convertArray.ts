import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../convertSchemas";

export function convertArray({
    item,
    description,
    wrapAsOptional,
}: {
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
    wrapAsOptional: boolean;
}): Schema {
    const itemSchema = item == null ? Schema.unknown() : convertSchema(item, false);
    return wrapArray({
        itemSchema,
        wrapAsOptional,
        description,
    });
}

export function wrapArray({
    itemSchema,
    wrapAsOptional,
    description,
}: {
    itemSchema: Schema;
    wrapAsOptional: boolean;
    description: string | undefined;
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.array({
                value: itemSchema,
                description: undefined,
            }),
            description,
        });
    }
    return Schema.array({
        value: itemSchema,
        description,
    });
}
