import type { z } from "zod";

export function property<T extends z.ZodTypeAny>(_rawKey: string, schema: T): T {
    // In Zod, we handle key mapping differently - return schema as-is
    return schema;
}
