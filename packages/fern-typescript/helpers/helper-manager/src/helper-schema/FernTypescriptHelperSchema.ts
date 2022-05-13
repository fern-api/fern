import { z } from "zod";
import { EncoderSchema } from "./EncoderSchema";

export const FernTypescriptHelperSchema = z.object({
    encodings: z.optional(z.record(EncoderSchema)),
});

export type FernTypescriptHelperSchema = z.infer<typeof FernTypescriptHelperSchema>;
