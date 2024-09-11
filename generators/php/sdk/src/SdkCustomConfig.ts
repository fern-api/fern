import { z } from "zod";

export const SdkCustomConfigSchema = z.strictObject({
    namespace: z.string().optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
