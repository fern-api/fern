import { z } from "zod";

export const ProjectConfigSchema = z.strictObject({
    organization: z.string(),
    version: z.string()
});

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
