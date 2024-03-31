import { z } from "zod";

export const SdkCustomConfigSchema = z.strictObject({
    "client-class-name": z.string().optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
