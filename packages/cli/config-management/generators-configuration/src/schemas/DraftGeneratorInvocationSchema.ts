import { z } from "zod";
import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";

export const DraftGeneratorInvocationSchema = BaseGeneratorInvocationSchema.extend({
    mode: z.literal("publish").or(z.literal("download-files")),
    "output-path": z.string(),
});

export type DraftGeneratorInvocationSchema = z.infer<typeof DraftGeneratorInvocationSchema>;
