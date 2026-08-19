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
    wrapAsOptional,
    wrapAsNullable,
    value,
    description,
    availability,
    namespace,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    title: string | undefined;
    value: unknown;
    wrapAsOptional: boolean;
    wrapAsNullable: boolean;
    description: string | undefined;
    availability: Availability | undefined;
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    let result: SchemaWithExample = SchemaWithExample.literal({
        nameOverride,
        generatedName,
        title,
        value: createLiteralSchemaValue(value),
        description,
        availability,
        namespace,
        groupName
    });
    if (wrapAsNullable) {
        result = SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            title,
            value: result,
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }
    if (wrapAsOptional) {
        result = SchemaWithExample.optional({
            nameOverride,
            generatedName,
            title,
            value: result,
            description,
            availability,
            namespace,
            groupName,
            inline: undefined
        });
    }
    return result;
}
