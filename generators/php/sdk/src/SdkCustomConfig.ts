import { BasePhpCustomConfigSchema } from "@fern-api/php-codegen";
import { z } from "zod";

export const SdkCustomConfigSchema = z
    .strictObject({
        // Deprecated; use clientName instead.
        "client-class-name": z.string().optional(),
        // Enable WireMock-based wire tests generation
        "enable-wire-tests": z.boolean().optional(),
        // Custom class name for the CustomPager class (used for custom pagination)
        "custom-pager-classname": z.string().optional()
    })
    .extend(BasePhpCustomConfigSchema.shape)
    .transform((config) => ({
        ...config,
        enableWireTests: config["enable-wire-tests"] ?? false,
        customPagerClassname: config["custom-pager-classname"] ?? "CustomPager"
    }));

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
