import { z } from "zod";

export const FernConfigJson = z.strictObject({
    organization: z.string(),
    version: z.string()
});

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
