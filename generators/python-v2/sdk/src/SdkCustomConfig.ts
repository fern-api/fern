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

export const SdkCustomConfigSchema = z.object({
    enable_wire_tests: z.boolean().optional(),
    package_path: relativePathSchema.optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
