import { z } from "zod";

export const DependenciesConfigurationSchema = z.object({
    dependencies: z.record(z.string(), z.string())
});

export type DependenciesConfigurationSchema = z.infer<typeof DependenciesConfigurationSchema>;
