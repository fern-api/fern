import { z } from "zod";

export const TypescriptGeneratorConfigSchema = z.strictObject({
    packageName: z.string(),
    mode: z.enum(["client", "server", "model"]),
});

export type TypescriptGeneratorConfigSchema = z.infer<typeof TypescriptGeneratorConfigSchema>;
