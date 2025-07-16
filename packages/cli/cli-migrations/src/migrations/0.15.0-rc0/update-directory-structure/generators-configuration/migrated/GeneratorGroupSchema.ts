import { z } from "zod";

import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";

export const GeneratorGroupSchema = z.strictObject({
    audiences: z.optional(z.array(z.string())),
    generators: z.array(GeneratorInvocationSchema)
});

export type GeneratorGroupSchema = z.infer<typeof GeneratorGroupSchema>;
