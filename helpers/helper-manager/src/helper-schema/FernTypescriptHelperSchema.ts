import { z } from "zod";
import { EncoderSchema } from "./EncoderSchema";

export const FernTypescriptHelperSchema = z.object({
    encodings: z.record(EncoderSchema).optional(),
});

export type FernTypescriptHelperSchema = z.infer<typeof FernTypescriptHelperSchema>;
