import { z } from "zod";

import { GeneratorGroupDocsConfigurationSchema } from "./GeneratorGroupDocsConfigurationSchema.js";
import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema.js";

export const GeneratorGroupSchema = z.strictObject({
    audiences: z.optional(z.array(z.string())),
    docs: z.optional(GeneratorGroupDocsConfigurationSchema),
    generators: z.array(GeneratorInvocationSchema)
});

export type GeneratorGroupSchema = z.infer<typeof GeneratorGroupSchema>;
