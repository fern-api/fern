import { OpenAPIV3 } from "openapi-types";

import { Availability, SchemaWithExample, SdkGroupName, Source } from "@fern-api/openapi-ir";

import { OverrideTypeName } from "../openapi/v3/extensions/getFernTypeNameExtension";
import { SchemaParserContext } from "./SchemaParserContext";
import { convertSchema } from "./convertSchemas";

export function convertArray({
    overrideTypeName,
    generatedName,
    title,
    breadcrumbs,
    item,
    description,
    availability,
    wrapAsNullable,
    context,
    namespace,
    groupName,
    example,
    source
}: {
    overrideTypeName: OverrideTypeName | undefined;
    generatedName: string;
    title: string | undefined;
    breadcrumbs: string[];
    item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    context: SchemaParserContext;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    example: unknown[] | undefined;
    source: Source;
}): SchemaWithExample {
    const itemSchema =
        item == null
            ? SchemaWithExample.unknown({
                  nameOverride: overrideTypeName?.value,
                  casing: overrideTypeName?.casing,
                  generatedName,
                  title,
                  description: undefined,
                  availability: undefined,
                  example: undefined,
                  namespace,
                  groupName
              })
            : convertSchema(item, false, context, [...breadcrumbs, "Item"], source, namespace);
    return wrapArray({
        overrideTypeName,
        generatedName,
        title,
        namespace,
        groupName,
        itemSchema,
        wrapAsNullable,
        description,
        availability,
        example
    });
}

export function wrapArray({
    overrideTypeName,
    generatedName,
    title,
    itemSchema,
    wrapAsNullable,
    description,
    availability,
    namespace,
    groupName,
    example
}: {
    overrideTypeName: OverrideTypeName | undefined;
    generatedName: string;
    title: string | undefined;
    itemSchema: SchemaWithExample;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
    example: unknown[] | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride: overrideTypeName?.value,
            casing: overrideTypeName?.casing,
            generatedName,
            title,
            value: SchemaWithExample.array({
                nameOverride: overrideTypeName?.value,
                casing: overrideTypeName?.casing,
                generatedName,
                title,
                value: itemSchema,
                description,
                availability,
                namespace,
                groupName,
                example,
                inline: undefined
            }),
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }
    return SchemaWithExample.array({
        nameOverride: overrideTypeName?.value,
        casing: overrideTypeName?.casing,
        generatedName,
        title,
        value: itemSchema,
        description,
        availability,
        namespace,
        groupName,
        example,
        inline: undefined
    });
}
