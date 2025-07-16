import { z } from 'zod'

export const BaseCsharpCustomConfigSchema = z.object({
    // Influence dynamic snippets.
    namespace: z.string().optional(),
    'base-api-exception-class-name': z.string().optional(),
    'base-exception-class-name': z.string().optional(),
    'client-class-name': z.string().optional(),
    'environment-class-name': z.string().optional(),
    'exported-client-class-name': z.string().optional(),
    'explicit-namespaces': z.boolean().optional(),
    'inline-path-parameters': z.boolean().optional(),
    'read-only-memory-types': z.optional(z.array(z.string())),
    'root-namespace-for-core-classes': z.boolean().optional(),
    'use-discriminated-unions': z.boolean().optional(),

    // General options.
    'root-client-class-access': z.enum(['public', 'internal']).optional(),
    'custom-pager-name': z.string().optional(),
    'enable-forward-compatible-enums': z.boolean().optional(),
    'additional-properties': z.boolean().optional(),
    'generate-error-types': z.boolean().optional(),
    'package-id': z.string().optional(),
    'generate-mock-server-tests': z.boolean().optional(),
    'include-exception-handler': z.boolean().optional(),

    // Deprecated.
    'extra-dependencies': z
        .record(z.string())
        .optional()
        .describe(
            '(Deprecated) The extra dependencies to add into the csproj file. Use the [ProjectName].Custom.props to configure additional dependencies instead.'
        ),
    'pascal-case-environments': z.boolean().optional(),
    'simplify-object-dictionaries': z.boolean().optional(),
    'experimental-enable-forward-compatible-enums': z.boolean().optional(),
    'experimental-additional-properties': z.boolean().optional()
})

export type BaseCsharpCustomConfigSchema = z.infer<typeof BaseCsharpCustomConfigSchema>
