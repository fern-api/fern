import { z } from "zod";

export const DependenciesFileSchema = z.object({
    dependencies: z.optional(z.record(z.string(), z.string())),
});

export type DependenciesFileSchema = z.infer<typeof DependenciesFileSchema>;
