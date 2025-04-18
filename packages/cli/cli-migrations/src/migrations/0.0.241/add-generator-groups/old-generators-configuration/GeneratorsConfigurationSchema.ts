import { z } from "zod";

import { DraftGeneratorInvocationSchema } from "./DraftGeneratorInvocationSchema";
import { ReleaseGeneratorInvocationSchema } from "./ReleaseGeneratorInvocationSchema";

export const GeneratorsConfigurationSchema = z.strictObject({
    draft: z.optional(z.array(DraftGeneratorInvocationSchema)),
    release: z.optional(z.array(ReleaseGeneratorInvocationSchema))
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
