import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import { LiteralSchemaValue } from "@fern-fern/openapi-ir-model/finalIr";
import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";

export function convertLiteral({
    wrapAsNullable,
    value,
    description,
    groupName
}: {
    value: string;
    wrapAsNullable: boolean;
    description: string | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: SchemaWithExample.literal({
                value: LiteralSchemaValue.string(value),
                description,
                groupName
            }),
            description,
            groupName
        });
    }
    return SchemaWithExample.literal({
        value: LiteralSchemaValue.string(value),
        description,
        groupName
    });
}
