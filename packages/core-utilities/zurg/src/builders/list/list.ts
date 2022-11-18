import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

export function list<Raw, Parsed>(schema: Schema<Raw, Parsed>): Schema<Raw[], Parsed[]> {
    const baseSchema: BaseSchema<Raw[], Parsed[]> = {
        parse: (raw, opts) => Promise.all(raw.map((item) => schema.parse(item, opts))),
        json: (parsed, opts) => Promise.all(parsed.map((item) => schema.json(item, opts))),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
