import { z } from "zod";

export const BaseGeneratorInvocationSchema: z.ZodObject<
    {
        name: z.ZodString;
        version: z.ZodString;
        config: z.ZodUnknown;
        audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    },
    "strict",
    z.ZodTypeAny,
    { version: string; name: string; audiences?: Array<string> | undefined; config?: unknown },
    { version: string; name: string; audiences?: Array<string> | undefined; config?: unknown }
> = z.strictObject({
    name: z.string(),
    version: z.string(),
    config: z.unknown(),
    audiences: z.optional(z.array(z.string()))
});

export type BaseGeneratorInvocationSchema = z.infer<typeof BaseGeneratorInvocationSchema>;
