import { LiteralSchemaValue, SchemaWithExample, SdkGroupName } from "@fern-api/openapi-ir-sdk";

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
    wrapAsNullable,
    value,
    description,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    value: unknown;
    wrapAsNullable: boolean;
    description: string | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.literal({
                nameOverride,
                generatedName,
                value: createLiteralSchemaValue(value),
                description,
                groupName
            }),
            description,
            groupName
        });
    }
    return SchemaWithExample.literal({
        nameOverride,
        generatedName,
        value: createLiteralSchemaValue(value),
        description,
        groupName
    });
}
