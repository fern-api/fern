import { z } from 'zod'

export const PydanticConfig = z.object({
    // Influence dynamic snippets.
    enum_type: z.enum(['literals', 'forward_compatible_python_enums', 'python_enums']).optional().default('literals'),
    include_union_utils: z.boolean().optional().default(false),
    union_naming: z.enum(['v0', 'v1']).optional().default('v0'),

    // General options.
    extra_fields: z.enum(['allow', 'forbid']).optional(),
    include_validators: z.boolean().optional(),
    skip_formatting: z.boolean().optional(),

    // Deprecated.
    forbid_extra_fields: z.boolean().optional(),
    frozen: z.boolean().optional(),
    orm_mode: z.boolean().optional(),
    package_name: z.string().optional(),
    require_optional_fields: z.boolean().optional(),
    skip_validation: z.boolean().optional(),
    smart_union: z.boolean().optional(),
    use_provided_defaults: z.boolean().optional(),
    use_string_enums: z.boolean().optional(),
    version_compatibility: z.enum(['v1', 'v2', 'both', 'v1_on_v2']).optional(),
    wrapped_aliases: z.boolean().optional()
})

export type PydanticConfig = z.infer<typeof PydanticConfig>
