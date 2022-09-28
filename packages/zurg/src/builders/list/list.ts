import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

export function list<Raw, Parsed>(schema: Schema<Raw, Parsed>): Schema<Raw[], Parsed[]> {
    const baseSchema: BaseSchema<Raw[], Parsed[]> = {
        parse: (raw, opts) => raw.map((item) => schema.parse(item, opts)),
        json: (parsed, opts) => parsed.map((item) => schema.json(item, opts)),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
