import { z } from "zod";

import { DraftGeneratorInvocationSchema } from "./DraftGeneratorInvocationSchema.js";
import { ReleaseGeneratorInvocationSchema } from "./ReleaseGeneratorInvocationSchema.js";

export const GeneratorsConfigurationSchema = z.strictObject({
    draft: z.optional(z.array(DraftGeneratorInvocationSchema)),
    release: z.optional(z.array(ReleaseGeneratorInvocationSchema))
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
