import { z } from "zod";

// Schema for Rust dependency specification (matches RustDependencySpec interface)
export const RustDependencySpecSchema: z.ZodObject<{ version: z.ZodString; features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>; optional: z.ZodOptional<z.ZodBoolean>; defaultFeatures: z.ZodOptional<z.ZodBoolean>; package: z.ZodOptional<z.ZodString>; path: z.ZodOptional<z.ZodString>; git: z.ZodOptional<z.ZodString>; branch: z.ZodOptional<z.ZodString>; rev: z.ZodOptional<z.ZodString>; registry: z.ZodOptional<z.ZodString>; }, "strip", z.ZodTypeAny, { version: string; path?: string | undefined; features?: Array<string> | undefined; optional?: boolean | undefined; defaultFeatures?: boolean | undefined; package?: string | undefined; git?: string | undefined; branch?: string | undefined; rev?: string | undefined; registry?: string | undefined; }, { version: string; path?: string | undefined; features?: Array<string> | undefined; optional?: boolean | undefined; defaultFeatures?: boolean | undefined; package?: string | undefined; git?: string | undefined; branch?: string | undefined; rev?: string | undefined; registry?: string | undefined; }> = z.object({
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
export const DependencyValueSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{ version: z.ZodString; features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>; optional: z.ZodOptional<z.ZodBoolean>; defaultFeatures: z.ZodOptional<z.ZodBoolean>; package: z.ZodOptional<z.ZodString>; path: z.ZodOptional<z.ZodString>; git: z.ZodOptional<z.ZodString>; branch: z.ZodOptional<z.ZodString>; rev: z.ZodOptional<z.ZodString>; registry: z.ZodOptional<z.ZodString>; }, "strip", z.ZodTypeAny, { version: string; path?: string | undefined; features?: Array<string> | undefined; optional?: boolean | undefined; defaultFeatures?: boolean | undefined; package?: string | undefined; git?: string | undefined; branch?: string | undefined; rev?: string | undefined; registry?: string | undefined; }, { version: string; path?: string | undefined; features?: Array<string> | undefined; optional?: boolean | undefined; defaultFeatures?: boolean | undefined; package?: string | undefined; git?: string | undefined; branch?: string | undefined; rev?: string | undefined; registry?: string | undefined; }>]> = z.union([z.string(), RustDependencySpecSchema]);

export type RustDependencySpec = z.infer<typeof RustDependencySpecSchema>;
export type DependencyValue = z.infer<typeof DependencyValueSchema>;
