import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";

export function convertArray({
    breadcrumbs,
    item,
    description,
    wrapAsNullable,
    context,
    groupName
}: {
    breadcrumbs: string[];
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
    wrapAsNullable: boolean;
    context: AbstractOpenAPIV3ParserContext;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    const itemSchema =
        item == null
            ? SchemaWithExample.unknown({ description: undefined, example: undefined, groupName })
            : convertSchema(item, false, context, [...breadcrumbs, "Item"]);
    return wrapArray({
        groupName,
        itemSchema,
        wrapAsNullable,
        description
    });
}

export function wrapArray({
    itemSchema,
    wrapAsNullable,
    description,
    groupName
}: {
    itemSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: SchemaWithExample.array({
                value: itemSchema,
                description,
                groupName
            }),
            description,
            groupName
        });
    }
    return SchemaWithExample.array({
        value: itemSchema,
        description,
        groupName
    });
}
