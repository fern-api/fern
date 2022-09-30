import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

export function lazy<Raw, Parsed>(getter: () => Schema<Raw, Parsed>): Schema<Raw, Parsed> {
    const baseSchema: BaseSchema<Raw, Parsed> = {
        parse: (raw) => getter().parse(raw),
        json: (parsed) => getter().json(parsed),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
