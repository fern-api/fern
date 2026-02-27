import { z } from "zod";

export const OpenRpcSettingsSchema = z.object({
    // TODO: Add OpenRPC-specific settings here.
});

export type OpenRpcSettingsSchema = z.infer<typeof OpenRpcSettingsSchema>;

export const OpenRpcSpecSchema = z.object({
    openrpc: z.string(),
    overrides: z.string().optional(),
    settings: OpenRpcSettingsSchema.optional()
});

export type OpenRpcSpecSchema = z.infer<typeof OpenRpcSpecSchema>;
