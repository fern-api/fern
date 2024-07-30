import { z } from "zod";

export const SdkCustomConfigSchema = z.strictObject({
    namespace: z.string().optional(),
    "explicit-namespaces": z.boolean().optional(),
    "client-class-name": z.string().optional(),
    "extra-dependencies": z.record(z.string()).optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
