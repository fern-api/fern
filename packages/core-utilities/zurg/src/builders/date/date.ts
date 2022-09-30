import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

export function date(): Schema<string, Date> {
    const baseSchema: BaseSchema<string, Date> = {
        parse: (raw) => new Date(raw),
        json: (date) => date.toISOString(),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
