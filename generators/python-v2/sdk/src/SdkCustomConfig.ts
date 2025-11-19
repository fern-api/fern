import { z } from "zod";

export const SdkCustomConfigSchema = z.object({
    enableWireTests: z.boolean().optional().default(false)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
