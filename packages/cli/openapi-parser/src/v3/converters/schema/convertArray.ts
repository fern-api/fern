import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";

export function convertArray({
    breadcrumbs,
    item,
    description,
    wrapAsNullable,
    context,
}: {
    breadcrumbs: string[];
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
    wrapAsNullable: boolean;
    context: AbstractOpenAPIV3ParserContext;
}): Schema {
    const itemSchema = item == null ? Schema.unknown() : convertSchema(item, false, context, [...breadcrumbs, "Item"]);
    return wrapArray({
        itemSchema,
        wrapAsNullable,
        description,
    });
}

export function wrapArray({
    itemSchema,
    wrapAsNullable,
    description,
}: {
    itemSchema: Schema;
    wrapAsNullable: boolean;
    description: string | undefined;
}): Schema {
    if (wrapAsNullable) {
        return Schema.nullable({
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
