import { z } from "zod";

// This return type is too crazy to write explicitly!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function inlinableType<T extends z.ZodRawShape>(shape: T) {
    return z.union([
        z.string(),
        z
            .strictObject({
                type: z.optional(z.string()),
            })
            .extend(shape),
    ]);
}

export const SimpleInlinableType = inlinableType({});

export type SimpleInlinableType = z.infer<typeof SimpleInlinableType>;
