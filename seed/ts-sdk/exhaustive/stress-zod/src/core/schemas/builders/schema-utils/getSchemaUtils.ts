import type { z } from "zod";
import type { Schema } from "../../Schema.js";

export function getSchemaUtils<T extends z.ZodTypeAny>(schema: T): Schema<z.input<T>, z.output<T>> {
    return {
        parse: (raw) => {
            const result = schema.safeParse(raw);
            return result.success ? result.data : raw;
        },
        json: (parsed) => parsed as any,
        parseOrThrow: (raw) => schema.parse(raw),
        jsonOrThrow: (parsed) => parsed as any,
        optional: () => getSchemaUtils(schema.optional()) as any,
    };
}
