import { z } from "zod";
import { EncodingHandlersSchema } from "./EncodingHandlersSchema";

export const FernTypescriptHelperSchema = z.object({
    encodings: z.optional(z.record(EncodingHandlersSchema)),
});

export type FernTypescriptHelperSchema = z.infer<typeof FernTypescriptHelperSchema>;
