import { z } from "zod";

export const ProjectConfigSchema = z
    .object({
        organization: z.string(),
        version: z.string()
    })
    .strict();

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
