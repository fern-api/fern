import { z } from "zod";

export const OpenRpcSettingsSchema: z.ZodObject<{}, z.core.$strip> = z.object({
    // TODO: Add OpenRPC-specific settings here.
});

export type OpenRpcSettingsSchema = z.infer<typeof OpenRpcSettingsSchema>;

export const OpenRpcSpecSchema: z.ZodObject<
    {
        openrpc: z.ZodString;
        overrides: z.ZodOptional<z.ZodString>;
        settings: z.ZodOptional<z.ZodObject<{}, z.core.$strip>>;
    },
    z.core.$strip
> = z.object({
    openrpc: z.string(),
    overrides: z.string().optional(),
    settings: OpenRpcSettingsSchema.optional()
});

export type OpenRpcSpecSchema = z.infer<typeof OpenRpcSpecSchema>;
