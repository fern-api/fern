import { z } from "zod";

import { GeneratorGroupSchema } from "./GeneratorGroupSchema.js";

export const GeneratorsConfigurationSchema = z.strictObject({
    "default-group": z.optional(z.string()),
    groups: z.optional(z.record(GeneratorGroupSchema))
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
