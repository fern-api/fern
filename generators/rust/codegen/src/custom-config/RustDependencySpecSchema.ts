import { z } from "zod";

// Schema for Rust dependency specification (matches RustDependencySpec interface)
export const RustDependencySpecSchema = z.object({
    version: z.string(),
    features: z.array(z.string()).optional(),
    optional: z.boolean().optional(),
    defaultFeatures: z.boolean().optional(),
    package: z.string().optional(),
    path: z.string().optional(),
    git: z.string().optional(),
    branch: z.string().optional(),
    rev: z.string().optional(),
    registry: z.string().optional()
});

// Dependency value can be either a version string or a full spec object
export const DependencyValueSchema = z.union([z.string(), RustDependencySpecSchema]);

export type RustDependencySpec = z.infer<typeof RustDependencySpecSchema>;
export type DependencyValue = z.infer<typeof DependencyValueSchema>;
