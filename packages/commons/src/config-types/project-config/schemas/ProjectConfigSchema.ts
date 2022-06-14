import { z } from "zod";

export const ProjectConfigSchema = z.strictObject({
    workspaces: z.optional(z.array(z.string())),
});

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
