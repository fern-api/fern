import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

export function set<Raw, Parsed>(schema: Schema<Raw, Parsed>): Schema<Raw[], Set<Parsed>> {
    const baseSchema: BaseSchema<Raw[], Set<Parsed>> = {
        parse: async (raw, opts) => new Set(await Promise.all(raw.map((item) => schema.parse(item, opts)))),
        json: (parsed, opts) => Promise.all([...parsed].map((item) => schema.json(item, opts))),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
