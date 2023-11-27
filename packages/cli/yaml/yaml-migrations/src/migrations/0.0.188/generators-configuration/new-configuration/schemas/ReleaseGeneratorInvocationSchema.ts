import { z } from "zod";
import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";
import { GeneratorOutputsSchema } from "./GeneratorOutputsSchema";

export const ReleaseGeneratorInvocationSchema = BaseGeneratorInvocationSchema.extend({
    outputs: GeneratorOutputsSchema
});

export type ReleaseGeneratorInvocationSchema = z.infer<typeof ReleaseGeneratorInvocationSchema>;
