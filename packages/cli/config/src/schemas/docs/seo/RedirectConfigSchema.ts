import { z } from "zod";

export const RedirectConfigSchema = z.object({
    source: z.string(),
    destination: z.string(),
    permanent: z.boolean().optional()
});

export type RedirectConfigSchema = z.infer<typeof RedirectConfigSchema>;
