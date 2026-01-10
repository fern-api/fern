import path from "path";
import { z } from "zod";

/**
 * Schema for validating and normalizing relative paths.
 * Rejects absolute paths, parent traversal, and invalid characters.
 * Normalizes by stripping leading/trailing slashes.
 */
const relativePathSchema = z
    .string()
    .refine((pathStr) => !path.isAbsolute(pathStr), {
        message: "path must be relative, not absolute"
    })
    .refine((pathStr) => !pathStr.startsWith("..") && !pathStr.includes("/../"), {
        message: "for safety reasons, path can't traverse up with /../"
    })
    .refine(
        (pathStr) => {
            const invalidChars = ["<", ">", ":", '"', "|", "?", "*"];
            return !invalidChars.some((char) => pathStr.includes(char));
        },
        {
            message: "path contains invalid characters"
        }
    )
    .refine((pathStr) => pathStr.length <= 260, {
        message: "path too long (max 260 chars)"
    })
    .transform((pathStr) => pathStr.replace(/^\/+|\/+$/g, ""));

/**
 * Schema for client configuration options that affect the generated client class name.
 */
const ClientConfigSchema = z.object({
    filename: z.string().optional(),
    class_name: z.string().optional(),
    exported_filename: z.string().optional(),
    exported_class_name: z.string().optional()
});

export const SdkCustomConfigSchema = z.object({
    enable_wire_tests: z.boolean().optional(),
    package_path: relativePathSchema.optional(),
    client: ClientConfigSchema.optional(),
    client_class_name: z.string().optional(),
    inline_request_params: z.boolean().optional(),
    wire_test_exclusions: z.array(z.string()).optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
