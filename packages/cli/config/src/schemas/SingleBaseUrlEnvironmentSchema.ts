import { z } from "zod";

export const SingleBaseUrlEnvironmentSchema = z.object({
    url: z.string(),
    docs: z.string().optional()
});

export type SingleBaseUrlEnvironmentSchema = z.infer<typeof SingleBaseUrlEnvironmentSchema>;
