import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parse-stage/ir";
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
}): SchemaWithExample {
    const itemSchema =
        item == null
            ? SchemaWithExample.unknown({ example: undefined })
            : convertSchema(item, false, context, [...breadcrumbs, "Item"]);
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
    itemSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: SchemaWithExample.array({
                value: itemSchema,
                description,
            }),
            description,
        });
    }
    return SchemaWithExample.array({
        value: itemSchema,
        description,
    });
}
