import { z } from "zod";

export const DependenciesConfigurationSchema: z.ZodObject<
    { dependencies: z.ZodRecord<z.ZodString, z.ZodString> },
    "strip",
    z.ZodTypeAny,
    { dependencies: Record<string, string> },
    { dependencies: Record<string, string> }
> = z.object({
    dependencies: z.record(z.string(), z.string())
});

export type DependenciesConfigurationSchema = z.infer<typeof DependenciesConfigurationSchema>;
