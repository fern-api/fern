import { z } from "zod";
import { KotlinCustomConfigSchema } from "@fern-api/kotlin-base";

export const SdkCustomConfigSchema = KotlinCustomConfigSchema.extend({
    clientName: z.string().optional(),
    enableWireTests: z.boolean().optional(),
    enablePagination: z.boolean().optional(),
    enableStreaming: z.boolean().optional()
});

export type SdkCustomConfig = z.infer<typeof SdkCustomConfigSchema>;
