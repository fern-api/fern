import { BaseSchema, Schema } from "./Schema";

export interface SchemaUtils<Raw, Parsed> {
    optional: () => Schema<Raw | null | undefined, Parsed | undefined>;
}

export function getSchemaUtils<Raw, Parsed>(schema: BaseSchema<Raw, Parsed>): SchemaUtils<Raw, Parsed> {
    return {
        optional: () => {
            const baseSchema: BaseSchema<Raw | null | undefined, Parsed | undefined> = {
                parse: (raw, opts) => (raw != null ? schema.parse(raw, opts) : undefined),
                json: (parsed, opts) => (parsed != null ? schema.json(parsed, opts) : undefined),
            };

            return {
                ...baseSchema,
                ...getSchemaUtils(baseSchema),
            };
        },
    };
}
