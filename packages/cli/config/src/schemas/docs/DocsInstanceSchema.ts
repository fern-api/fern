import { z } from "zod";

export const EditThisPageConfigSchema = z.object({
    github: z
        .object({
            host: z.string().optional(),
            owner: z.string(),
            repo: z.string(),
            branch: z.string().optional(),
            path: z.string().optional()
        })
        .optional()
});

export type EditThisPageConfigSchema = z.infer<typeof EditThisPageConfigSchema>;

export const DocsInstanceSchema = z.object({
    url: z.string(),
    customDomain: z.union([z.string(), z.array(z.string())]).optional(),
    audiences: z.array(z.string()).optional(),
    editThisPage: EditThisPageConfigSchema.optional(),
    private: z.boolean().optional()
});

export type DocsInstanceSchema = z.infer<typeof DocsInstanceSchema>;
