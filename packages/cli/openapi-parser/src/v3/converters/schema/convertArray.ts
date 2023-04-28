import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";

export function convertArray({
    item,
    description,
    wrapAsOptional,
    context,
}: {
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
    wrapAsOptional: boolean;
    context: OpenAPIV3ParserContext;
}): Schema {
    const itemSchema = item == null ? Schema.unknown() : convertSchema(item, false, context);
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
