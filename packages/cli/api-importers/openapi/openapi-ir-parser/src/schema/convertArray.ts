import { Availability, SchemaWithExample, SdkGroupName, Source } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "./convertSchemas";
import { SchemaParserContext } from "./SchemaParserContext";

export function convertArray({
    nameOverride,
    generatedName,
    originalName,
    title,
    breadcrumbs,
    item,
    description,
    availability,
    wrapAsNullable,
    context,
    groupName,
    example,
    source,
    namespace
}: {
    nameOverride: string | undefined;
    generatedName: string;
    originalName: string | undefined;
    title: string | undefined;
    breadcrumbs: string[];
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    groupName: SdkGroupName | undefined;
    example: unknown[] | undefined;
    source: Source;
    namespace: string | undefined;
}): SchemaWithExample {
    const itemSchema =
        item == null
            ? SchemaWithExample.unknown({
                  nameOverride,
                  generatedName,
                  originalName,
                  title,
                  description: undefined,
                  availability: undefined,
                  example: undefined,
                  groupName
              })
            : convertSchema({
                  schema: item,
                  wrapAsNullable: false,
                  context,
                  breadcrumbs: [...breadcrumbs, "Item"],
                  source,
                  namespace,
                  originalName,
                  referencedAsRequest: false,
                  propertiesToExclude: new Set()
              });
    return wrapArray({
        nameOverride,
        generatedName,
        originalName,
        title,
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
    originalName,
    title,
    itemSchema,
    wrapAsNullable,
    description,
    availability,
    groupName,
    example
}: {
    nameOverride: string | undefined;
    generatedName: string;
    originalName: string | undefined;
    title: string | undefined;
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
            originalName,
            title,
            value: SchemaWithExample.array({
                nameOverride,
                generatedName,
                originalName,
                title,
                value: itemSchema,
                description,
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
        originalName,
        title,
        value: itemSchema,
        description,
        availability,
        groupName,
        example
    });
}
