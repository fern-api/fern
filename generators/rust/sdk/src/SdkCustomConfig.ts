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
    cliEmbedded: z.boolean().optional().default(false),
    /**
     * How the `step` attribute of `x-fern-pagination` is read on an offset-paginated endpoint.
     * `"item-index"` (the default, matching the TypeScript and Python generators) treats the offset
     * as an item index and advances it by the number of items the page returned. `"page-index"`
     * treats it as a page number and advances it by one.
     */
    offsetSemantics: z.enum(["item-index", "page-index"]).optional().default("item-index")
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
