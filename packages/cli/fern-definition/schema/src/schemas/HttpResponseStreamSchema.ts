import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpResponseStreamSchema = WithDocsSchema.extend({
    type: z.string(),
    format: z.union([z.literal("sse"), z.literal("json")]).optional(),
    terminator: z.optional(z.string())
});

export type HttpResponseStreamSchema = z.infer<typeof HttpResponseStreamSchema>;
