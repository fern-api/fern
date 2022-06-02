import { z } from "zod";
import { PluginInvocationSchema } from "./PluginInvocationSchema";

export const WorkspaceDefinitionSchema = z.strictObject({
    name: z.optional(z.string()),
    input: z.optional(z.string()),
    definition: z.optional(z.string()),
    plugins: z.optional(z.array(PluginInvocationSchema)),
    generators: z.optional(z.array(PluginInvocationSchema)),
});

export type WorkspaceDefinitionSchema = z.infer<typeof WorkspaceDefinitionSchema>;
