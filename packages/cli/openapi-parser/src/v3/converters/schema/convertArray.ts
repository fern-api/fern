import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { convertSchema } from "../convertSchemas";

export function convertArray({
    nameOverride,
    generatedName,
    breadcrumbs,
    item,
    description,
    wrapAsNullable,
    context,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
    wrapAsNullable: boolean;
    context: AbstractOpenAPIV3ParserContext;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    const itemSchema =
        item == null
            ? SchemaWithExample.unknown({
                  nameOverride,
                  generatedName,
                  description: undefined,
                  example: undefined,
                  groupName
              })
            : convertSchema(item, false, context, [...breadcrumbs, "Item"]);
    return wrapArray({
        nameOverride,
        generatedName,
        groupName,
        itemSchema,
        wrapAsNullable,
        description
    });
}

export function wrapArray({
    nameOverride,
    generatedName,
    itemSchema,
    wrapAsNullable,
    description,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    itemSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.array({
                nameOverride,
                generatedName,
                value: itemSchema,
                description,
                groupName
            }),
            description,
            groupName
        });
    }
    return SchemaWithExample.array({
        nameOverride,
        generatedName,
        value: itemSchema,
        description,
        groupName
    });
}
