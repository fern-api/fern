import { z } from "zod";

export const HttpResponseStreamSchema = z.strictObject({
    data: z.string(),
    terminator: z.optional(z.string()),
});

export type HttpResponseStreamSchema = z.infer<typeof HttpResponseStreamSchema>;
