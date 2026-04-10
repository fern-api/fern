import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema.js";
import { DependencyValueSchema } from "./RustDependencySpecSchema.js";

export const BaseRustCustomConfigSchema = z.object({
    // =========================================================================
    // Package Configuration
    // =========================================================================
    crateName: z.string().optional(),
    crateVersion: z.string().optional(),
    clientClassName: z.string().optional(),
    environmentEnumName: z.string().optional(),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    extraDependencies: z.record(DependencyValueSchema).optional(),
    extraDevDependencies: z.record(DependencyValueSchema).optional(),

    // =========================================================================
    // Package Metadata (for crates.io publishing)
    // =========================================================================
    packageDescription: z.string().optional(),
    packageLicense: z.string().optional(),
    // Path to a custom license file (e.g., "LICENSE.md"). When set, uses `license-file` instead of `license` in Cargo.toml.
    // This is useful when your license is not a standard SPDX identifier.
    packageLicenseFile: z.string().optional(),
    packageRepository: z.string().optional(),
    packageDocumentation: z.string().optional(),

    // =========================================================================
    // Generator Feature Flags (control code generation style)
    // =========================================================================
    // Generate wire tests for serialization/deserialization
    enableWireTests: z.boolean().optional().default(false),
    // Enable WebSocket client generation for APIs with WebSocket channels
    enableWebsockets: z.boolean().optional().default(false),
    // Alias for enableWebsockets (matches TypeScript/Python/Java config key)
    generateWebSocketClients: z.boolean().optional(),
    // DateTime type to use for datetime primitives:
    // - "offset": DateTime<FixedOffset> (default) - preserves original timezone, accepts any format (assumes UTC when no timezone)
    // - "utc": DateTime<Utc> - converts everything to UTC, accepts any format (assumes UTC when no timezone)
    dateTimeType: z.enum(["offset", "utc"]).optional().default("offset"),

    // =========================================================================
    // Cargo Features Configuration (control package dependencies)
    // =========================================================================
    // Custom Cargo features: maps feature name to list of dependencies/features it enables
    // Example: { "experimental": ["dep-a", "dep-b"], "advanced": ["sse"] }
    features: z.record(z.array(z.string())).optional(),
    // Override which features are in the default feature set
    // Example: ["sse"] to only include SSE in default features
    defaultFeatures: z.array(z.string()).optional(),
    maxRetries: z.number().int().min(0).optional(),

    // =========================================================================
    // Casing Configuration
    // =========================================================================
    // When true, common initialisms like ID, JSON, XML are uppercased in generated names
    // (e.g., UserID instead of UserId, JSONBody instead of JsonBody).
    // Default is false (idiomatic Rust casing).
    capitalizeInitialisms: z.boolean().optional().default(false)
});

export type BaseRustCustomConfigSchema = z.infer<typeof BaseRustCustomConfigSchema>;
