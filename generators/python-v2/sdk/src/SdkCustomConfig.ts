import { z } from "zod";

export const SdkCustomConfigSchema = z.object({
    generateWireTests: z.boolean().optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
