import { Availability, SchemaWithExample, SdkGroupName } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "./convertSchemas";
import { SchemaParserContext } from "./SchemaParserContext";

export function convertArray({
    nameOverride,
    generatedName,
    breadcrumbs,
    item,
    description,
    availability,
    wrapAsNullable,
    context,
    groupName,
    example
}: {
    nameOverride: string | undefined;
    generatedName: string;
    breadcrumbs: string[];
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
    example: unknown[] | undefined;
}): SchemaWithExample {
    const itemSchema =
        item == null
            ? SchemaWithExample.unknown({
                  nameOverride,
                  generatedName,
                  description: undefined,
                  availability: undefined,
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
        description,
        availability,
        example
    });
}

export function wrapArray({
    nameOverride,
    generatedName,
    itemSchema,
    wrapAsNullable,
    description,
    availability,
    groupName,
    example
}: {
    nameOverride: string | undefined;
    generatedName: string;
    itemSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    groupName: SdkGroupName | undefined;
    example: unknown[] | undefined;
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
                // TODO: maybe undefined?
                availability,
                groupName,
                example
            }),
            description,
            availability,
            groupName
        });
    }
    return SchemaWithExample.array({
        nameOverride,
        generatedName,
        value: itemSchema,
        description,
        availability,
        groupName,
        example
    });
}
