import { z } from "zod";

export const TypescriptPluginConfigSchema = z.strictObject({
    mode: z.enum(["client", "server", "model"]),
});

export type TypescriptPluginConfigSchema = z.infer<typeof TypescriptPluginConfigSchema>;
