import path from "path";
import { z } from "zod";

export const relativePathSchema = z
    .string()
    .refine(
        (pathStr) => {
            // check if absolute
            if (path.isAbsolute(pathStr)) {
                return false;
            }
            return true;
        },
        {
            message: `path must be relative, not absolute`
        }
    )
    .refine(
        (pathStr) => {
            // check for any illegal traversal
            if (pathStr.startsWith("..") || pathStr.includes("/../")) {
                return false;
            }
            return true;
        },
        {
            message: `for safety reasons, path can't traverse up with /../`
        }
    )
    .refine(
        (pathStr) => {
            // check for invalid chars
            const invalidChars = ["<", ">", ":", "\"", "|", "?", "*"];
            for (const char of invalidChars) {
                if (pathStr.includes(char)) {
                    return false;
                }
            }
            return true;
        },
        {
            message: `path contains invalid characters`
        }
    )
    .refine(
        (pathStr) => {
            // check for overlong paths
            if (pathStr.length > 260) {
                return false;
            }
            return true;
        },
        {
            message: `path too long (max 260 chars)`
        }
    );

export type RelativePathSchema = z.infer<typeof relativePathSchema>;
