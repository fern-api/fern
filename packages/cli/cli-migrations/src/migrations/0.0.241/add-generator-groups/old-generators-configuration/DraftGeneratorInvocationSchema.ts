import { z } from "zod";

import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";

export const DraftGeneratorInvocationSchema = BaseGeneratorInvocationSchema.extend({
    mode: z.union([z.literal("publish"), z.literal("download-files")]),
    "output-path": z.optional(z.string())
});

export type DraftGeneratorInvocationSchema = z.infer<typeof DraftGeneratorInvocationSchema>;
