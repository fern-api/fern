import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { z } from "zod";

export const SdkCustomConfigSchema = BaseRustCustomConfigSchema.extend({
    clientName: z.string().optional(),
    generateExamples: z.boolean().optional().default(true),
    /**
     * When true, the SDK is being generated in CLI-embedded mode:
     * - Model/type generation is skipped (types come from a co-generated types crate)
     * - The `RequestExecutor` trait and `HttpClient::with_executor()` are the primary API surface
     */
    cliEmbedded: z.boolean().optional().default(false)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
