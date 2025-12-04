import { z } from "zod";
import type { ObjectSchema } from "../../Schema.js";
import { getSchemaUtils } from "../schema-utils/getSchemaUtils.js";

export function object<T extends Record<string, z.ZodTypeAny>>(
    schema: T,
): ObjectSchema<z.input<z.ZodObject<T>>, z.output<z.ZodObject<T>>> {
    const zodSchema = z.object(schema);
    return {
        ...getSchemaUtils(zodSchema),
        extend: (extension) => object({ ...schema, ...(extension as any) }),
        passthrough: () => {
            const passSchema = zodSchema.passthrough();
            return {
                ...getSchemaUtils(passSchema),
                extend: (ext) => object({ ...schema, ...(ext as any) }),
                passthrough: () => object(schema) as any,
            };
        },
    } as any;
}

export const objectWithoutOptionalProperties = object;
