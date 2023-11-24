import { z } from "zod";
import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";

export const DraftGeneratorInvocationSchema = BaseGeneratorInvocationSchema.extend({
    "local-output": z.optional(z.string())
});

export type DraftGeneratorInvocationSchema = z.infer<typeof DraftGeneratorInvocationSchema>;
