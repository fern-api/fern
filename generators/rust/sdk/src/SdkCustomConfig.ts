import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { z } from "zod";

export const SdkCustomConfigSchema = BaseRustCustomConfigSchema.extend({
    clientName: z.string().optional(),
    generateExamples: z.boolean().optional().default(true),
    // Opt-in emission of endpoint availability annotations (`#[deprecated]` /
    // `@beta` doc comments). Annotating endpoints can break downstream builds
    // that treat warnings as errors (`RUSTFLAGS="-D warnings"`), so the flag
    // defaults to `false` and must be flipped to `true` in `generators.yml`.
    // TODO(next-major): flip default to true.
    generateEndpointAvailability: z.boolean().optional().default(false)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
