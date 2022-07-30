import { z } from "zod";

export const ProjectConfigSchema = z.strictObject({
    workspaces: z.array(z.string()).optional(),
    organization: z.string(),
});

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
