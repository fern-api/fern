import { z } from "zod";
import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";

export const WorkspaceConfigurationSchema = z.strictObject({
    name: z.string(),
    definition: z.string(),
    generators: z.array(GeneratorInvocationSchema),
});

export type WorkspaceConfigurationSchema = z.infer<typeof WorkspaceConfigurationSchema>;
