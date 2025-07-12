import { z } from "zod";

import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";

export const SdkCustomConfigSchema = z
    .strictObject({
        // Deprecated; use clientName instead.
        "client-class-name": z.string().optional()
    })
    .extend(BaseRustCustomConfigSchema.shape);

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
