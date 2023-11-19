import { LiteralSchemaValue } from "@fern-fern/openapi-ir-model/finalIr";
import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";

export function convertLiteral({
    wrapAsNullable,
    value,
    description,
}: {
    value: string;
    wrapAsNullable: boolean;
    description: string | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            value: SchemaWithExample.literal({
                value: LiteralSchemaValue.string(value),
                description,
            }),
            description,
        });
    }
    return SchemaWithExample.literal({
        value: LiteralSchemaValue.string(value),
        description,
    });
}
