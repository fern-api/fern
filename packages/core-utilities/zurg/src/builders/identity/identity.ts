import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

export function identity<T>(): Schema<T, T> {
    const baseSchema: BaseSchema<T, T> = {
        parse: (raw) => raw,
        json: (parsed) => parsed,
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}
