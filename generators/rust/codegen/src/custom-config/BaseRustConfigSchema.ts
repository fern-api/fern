import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

export const BaseRustCustomConfigSchema = z.object({
    // =========================================================================
    // Package Configuration
    // =========================================================================
    crateName: z.string().optional(),
    crateVersion: z.string().optional(),
    clientClassName: z.string().optional(),
    environmentEnumName: z.string().optional(),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    extraDependencies: z.record(z.string()).optional(),
    extraDevDependencies: z.record(z.string()).optional(),

    // =========================================================================
    // Package Metadata (for crates.io publishing)
    // =========================================================================
    packageDescription: z.string().optional(),
    packageLicense: z.string().optional(),
    packageRepository: z.string().optional(),
    packageDocumentation: z.string().optional(),

    // =========================================================================
    // Generator Feature Flags (control code generation style)
    // =========================================================================
    // Generate wire tests for serialization/deserialization
    enableWireTests: z.boolean().optional().default(false),

    // =========================================================================
    // Cargo Features Configuration (control package dependencies)
    // =========================================================================
    // Custom Cargo features: maps feature name to list of dependencies/features it enables
    // Example: { "experimental": ["dep-a", "dep-b"], "advanced": ["sse"] }
    features: z.record(z.array(z.string())).optional(),
    // Override which features are in the default feature set
    // Example: ["sse"] to only include SSE in default features
    defaultFeatures: z.array(z.string()).optional()
});

export type BaseRustCustomConfigSchema = z.infer<typeof BaseRustCustomConfigSchema>;
