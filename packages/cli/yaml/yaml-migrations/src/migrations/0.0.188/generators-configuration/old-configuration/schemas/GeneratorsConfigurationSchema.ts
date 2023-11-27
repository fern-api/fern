import { z } from "zod";
import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";

export const GeneratorsConfigurationSchema = z.strictObject({
    generators: z.array(GeneratorInvocationSchema)
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
