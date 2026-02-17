import { z } from "zod";

export const JsScriptStrategySchema = z.enum(["beforeInteractive", "afterInteractive", "lazyOnload"]);

export type JsScriptStrategySchema = z.infer<typeof JsScriptStrategySchema>;

export const JsRemoteConfigSchema = z.object({
    url: z.string(),
    strategy: JsScriptStrategySchema.optional()
});

export type JsRemoteConfigSchema = z.infer<typeof JsRemoteConfigSchema>;

export const JsFileConfigSchema = z.object({
    path: z.string(),
    strategy: JsScriptStrategySchema.optional()
});

export type JsFileConfigSchema = z.infer<typeof JsFileConfigSchema>;

export const JsConfigItemSchema = z.union([JsRemoteConfigSchema, JsFileConfigSchema]);

export type JsConfigItemSchema = z.infer<typeof JsConfigItemSchema>;

export const JsConfigSchema = z.union([JsConfigItemSchema, z.array(JsConfigItemSchema)]);

export type JsConfigSchema = z.infer<typeof JsConfigSchema>;
