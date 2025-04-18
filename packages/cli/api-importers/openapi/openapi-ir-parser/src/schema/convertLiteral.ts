import { Availability, LiteralSchemaValue, SchemaWithExample, SdkGroupName } from "@fern-api/openapi-ir";

function createLiteralSchemaValue(value: unknown): LiteralSchemaValue {
    if (typeof value === "string") {
        return LiteralSchemaValue.string(value);
    } else if (typeof value === "boolean") {
        return LiteralSchemaValue.boolean(value);
    } else {
        // TODO: support other types
        return LiteralSchemaValue.string(`${value}`);
    }
}

export function convertLiteral({
    nameOverride,
    generatedName,
    title,
    wrapAsNullable,
    value,
    description,
    availability,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    value: unknown;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: SchemaWithExample.literal({
                nameOverride,
                generatedName,
                title,
                value: createLiteralSchemaValue(value),
                description,
                availability,
                groupName
            }),
            description,
            availability,
            groupName,
            inline: undefined
        });
    }
    return SchemaWithExample.literal({
        nameOverride,
        generatedName,
        title,
        value: createLiteralSchemaValue(value),
        description,
        availability,
        groupName
    });
}
