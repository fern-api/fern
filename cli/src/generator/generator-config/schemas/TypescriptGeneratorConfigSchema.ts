import { z } from "zod";

export const TypescriptGeneratorConfigSchema = z.strictObject({
    mode: z.enum(["client", "server", "model"]),
});

export type TypescriptGeneratorConfigSchema = z.infer<typeof TypescriptGeneratorConfigSchema>;
