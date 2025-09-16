import { BasePhpCustomConfigSchema } from "@fern-api/php-codegen";
import { z } from "zod";
// Force test
export const SdkCustomConfigSchema = z
    .strictObject({
        // Deprecated; use clientName instead.
        "client-class-name": z.string().optional()
    })
    .extend(BasePhpCustomConfigSchema.shape);

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
