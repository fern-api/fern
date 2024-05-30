import { z } from "zod";

export const AudienceSchema = z.strictObject({
    include: z.optional(z.array(z.string())),
    exclude: z.optional(z.array(z.string()))
});

export type AudienceSchema = z.infer<typeof AudienceSchema>;
