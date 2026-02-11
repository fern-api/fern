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

/**
 * Schema for wire test configuration options.
 */
const WireTestsConfigSchema = z.object({
    enabled: z.boolean().optional(),
    exclusions: z.array(z.string()).optional()
});

export const SdkCustomConfigSchema: z.ZodObject<
    {
        enable_wire_tests: z.ZodOptional<z.ZodBoolean>;
        package_path: z.ZodOptional<
            z.ZodEffects<
                z.ZodEffects<
                    z.ZodEffects<
                        z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>,
                        string,
                        string
                    >,
                    string,
                    string
                >,
                string,
                string
            >
        >;
        client: z.ZodOptional<
            z.ZodObject<
                {
                    filename: z.ZodOptional<z.ZodString>;
                    class_name: z.ZodOptional<z.ZodString>;
                    exported_filename: z.ZodOptional<z.ZodString>;
                    exported_class_name: z.ZodOptional<z.ZodString>;
                },
                "strip",
                z.ZodTypeAny,
                {
                    filename?: string | undefined;
                    class_name?: string | undefined;
                    exported_filename?: string | undefined;
                    exported_class_name?: string | undefined;
                },
                {
                    filename?: string | undefined;
                    class_name?: string | undefined;
                    exported_filename?: string | undefined;
                    exported_class_name?: string | undefined;
                }
            >
        >;
        client_class_name: z.ZodOptional<z.ZodString>;
        inline_request_params: z.ZodOptional<z.ZodBoolean>;
        wire_tests: z.ZodOptional<
            z.ZodObject<
                { enabled: z.ZodOptional<z.ZodBoolean>; exclusions: z.ZodOptional<z.ZodArray<z.ZodString, "many">> },
                "strip",
                z.ZodTypeAny,
                { enabled?: boolean | undefined; exclusions?: string[] | undefined },
                { enabled?: boolean | undefined; exclusions?: string[] | undefined }
            >
        >;
    },
    "strip",
    z.ZodTypeAny,
    {
        enable_wire_tests?: boolean | undefined;
        package_path?: string | undefined;
        client?:
            | {
                  filename?: string | undefined;
                  class_name?: string | undefined;
                  exported_filename?: string | undefined;
                  exported_class_name?: string | undefined;
              }
            | undefined;
        client_class_name?: string | undefined;
        inline_request_params?: boolean | undefined;
        wire_tests?: { enabled?: boolean | undefined; exclusions?: string[] | undefined } | undefined;
    },
    {
        enable_wire_tests?: boolean | undefined;
        package_path?: string | undefined;
        client?:
            | {
                  filename?: string | undefined;
                  class_name?: string | undefined;
                  exported_filename?: string | undefined;
                  exported_class_name?: string | undefined;
              }
            | undefined;
        client_class_name?: string | undefined;
        inline_request_params?: boolean | undefined;
        wire_tests?: { enabled?: boolean | undefined; exclusions?: string[] | undefined } | undefined;
    }
> = z.object({
    /** @deprecated Use `wire_tests.enabled` instead */
    enable_wire_tests: z.boolean().optional(),
    package_path: relativePathSchema.optional(),
    client: ClientConfigSchema.optional(),
    client_class_name: z.string().optional(),
    inline_request_params: z.boolean().optional(),
    wire_tests: WireTestsConfigSchema.optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
