import { z } from "zod";
import { PluginInvocationSchema } from "./PluginInvocationSchema";

export const WorkspaceDefinitionSchema = z.strictObject({
    name: z.optional(z.string()),
    input: z.string(),
    plugins: z.array(PluginInvocationSchema),
});

export type WorkspaceDefinitionSchema = z.infer<typeof WorkspaceDefinitionSchema>;
