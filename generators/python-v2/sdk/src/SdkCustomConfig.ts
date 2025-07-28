import { z } from "zod";

export const SdkCustomConfigSchema = z.object({
    should_generate_wire_tests: z.boolean().optional().default(false)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
