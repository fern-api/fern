import { z } from "zod";
import { EncodingHandlersSchema } from "./EncodingHandlersSchema";

export const FernTypescriptPluginSchema = z.object({
    encodings: z.optional(z.record(EncodingHandlersSchema)),
});

export type FernTypescriptPluginSchema = z.infer<typeof FernTypescriptPluginSchema>;
