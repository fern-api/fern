import { z } from "zod";

export const SdkCustomConfigSchema = z.strictObject({
    namespace: z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional(),
    "base-api-exception-class-name": z.string().optional(),
    "base-exception-class-name": z.string().optional(),
    "client-class-name": z.string().optional(),
    "exported-client-class-name": z.string().optional(),
    "environment-class-name": z.string().optional(),
    "package-id": z.string().optional(),
    "explicit-namespaces": z.boolean().optional(),
    "root-namespace-for-core-classes": z.boolean().optional(),
    "pascal-case-environments": z.boolean().optional(),
    "generate-error-types": z.boolean().optional(),
    "extra-dependencies": z
        .record(z.string())
        .optional()
        .describe(
            "(Deprecated) The extra dependencies to add into the csproj file. Use the [ProjectName].Custom.props to configure additional dependencies instead."
        ),
    "read-only-memory-types": z.optional(z.array(z.string())),
    "experimental-enable-forward-compatible-enums": z.boolean().optional(),
    "generate-mock-server-tests": z.boolean().optional(),
    "inline-path-parameters": z.boolean().optional(),
    "custom-pager-name": z.string().optional(),
    "include-exception-handler": z.boolean().optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
