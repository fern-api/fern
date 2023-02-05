import { Schema, SchemaType } from "../../Schema";
import { createIdentitySchemaCreator } from "../../utils/createIdentitySchemaCreator";

export function enum_<U extends string, E extends U[]>(values: E): Schema<E[number], E[number]> {
    const validValues = new Set<string>(values);

    const schemaCreator = createIdentitySchemaCreator(SchemaType.ENUM, (value, { allowUnknownKeys = false } = {}) => {
        if (typeof value === "string" && (validValues.has(value) || allowUnknownKeys)) {
            return {
                ok: true,
                value: value as U,
            };
        } else {
            return {
                ok: false,
                errors: [
                    {
                        path: [],
                        message: "Not one of the allowed values",
                    },
                ],
            };
        }
    });

    return schemaCreator();
}
