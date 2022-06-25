import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaForType<T> = z.ZodType<T, any, unknown>;

export function validateSchema<T>(schema: SchemaForType<T>, value: unknown): Promise<T> {
    return schema.parseAsync(value);
}
