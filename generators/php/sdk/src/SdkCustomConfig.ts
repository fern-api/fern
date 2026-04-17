import { BasePhpCustomConfigSchema } from "@fern-api/php-codegen";
import { z } from "zod";

export const SdkCustomConfigSchema = z
    .strictObject({
        // Deprecated; use clientName instead.
        "client-class-name": z.string().optional(),
        // Enable WireMock-based wire tests generation
        "enable-wire-tests": z.boolean().optional(),
        // Custom class name for the CustomPager class (used for custom pagination)
        "custom-pager-classname": z.string().optional(),
        // Apply IR-defined default values to query parameters and headers in request wrappers
        useDefaultRequestParameterValues: z.boolean().optional(),
        // Generate interfaces for all SDK client classes to enable mocking and DI
        generateClientInterfaces: z.boolean().optional(),
        // Emit PHPDoc availability annotations (@deprecated / @beta) on generated SDK surfaces.
        // Today this covers endpoint methods; future work may extend it to services, types,
        // properties, enum values, webhooks, etc. under the same flag.
        // TODO(next-major): flip default to true.
        generateAvailabilityAnnotations: z.boolean().optional(),
        maxRetries: z.number().int().min(0).optional()
    })
    .extend(BasePhpCustomConfigSchema.shape)
    .transform((config) => ({
        ...config,
        enableWireTests: config["enable-wire-tests"] ?? false,
        customPagerClassname: config["custom-pager-classname"] ?? "CustomPager",
        useDefaultRequestParameterValues: config.useDefaultRequestParameterValues ?? false,
        generateClientInterfaces: config.generateClientInterfaces ?? false,
        generateAvailabilityAnnotations: config.generateAvailabilityAnnotations ?? false
    }));

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
