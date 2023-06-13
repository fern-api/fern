import { Schema } from "@fern-fern/openapi-ir-model/ir";

export function convertLiteral({
    wrapAsNullable,
    value,
    description,
}: {
    value: string;
    wrapAsNullable: boolean;
    description: string | undefined;
}): Schema {
    if (wrapAsNullable) {
        return Schema.nullable({
            value: Schema.literal({
                value,
                description,
            }),
            description,
        });
    }
    return Schema.literal({
        value,
        description,
    });
}
