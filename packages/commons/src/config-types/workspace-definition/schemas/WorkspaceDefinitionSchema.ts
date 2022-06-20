import { z } from "zod";
import { GeneratorInvocationSchema } from "./GeneratorInvocationSchema";

export const WorkspaceDefinitionSchema = z.strictObject({
    name: z.optional(z.string()),
    org: z.optional(z.string()),
    definition: z.string(),
    generators: z.array(GeneratorInvocationSchema),
});

export type WorkspaceDefinitionSchema = z.infer<typeof WorkspaceDefinitionSchema>;
