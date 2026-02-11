import { z } from "zod";

export const PydanticConfig: z.ZodObject<
    {
        enum_type: z.ZodDefault<
            z.ZodOptional<z.ZodEnum<["literals", "forward_compatible_python_enums", "python_enums"]>>
        >;
        include_union_utils: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        union_naming: z.ZodDefault<z.ZodOptional<z.ZodEnum<["v0", "v1"]>>>;
        coerce_numbers_to_str: z.ZodOptional<z.ZodBoolean>;
        extra_fields: z.ZodOptional<z.ZodEnum<["allow", "forbid", "ignore"]>>;
        include_validators: z.ZodOptional<z.ZodBoolean>;
        skip_formatting: z.ZodOptional<z.ZodBoolean>;
        forbid_extra_fields: z.ZodOptional<z.ZodBoolean>;
        frozen: z.ZodOptional<z.ZodBoolean>;
        orm_mode: z.ZodOptional<z.ZodBoolean>;
        package_name: z.ZodOptional<z.ZodString>;
        require_optional_fields: z.ZodOptional<z.ZodBoolean>;
        skip_validation: z.ZodOptional<z.ZodBoolean>;
        smart_union: z.ZodOptional<z.ZodBoolean>;
        use_provided_defaults: z.ZodOptional<z.ZodBoolean>;
        use_string_enums: z.ZodOptional<z.ZodBoolean>;
        version_compatibility: z.ZodOptional<z.ZodEnum<["v1", "v2", "both", "v1_on_v2"]>>;
        wrapped_aliases: z.ZodOptional<z.ZodBoolean>;
    },
    "strip",
    z.ZodTypeAny,
    {
        enum_type: "literals" | "forward_compatible_python_enums" | "python_enums";
        include_union_utils: boolean;
        union_naming: "v0" | "v1";
        package_name?: string | undefined;
        coerce_numbers_to_str?: boolean | undefined;
        extra_fields?: "allow" | "forbid" | "ignore" | undefined;
        include_validators?: boolean | undefined;
        skip_formatting?: boolean | undefined;
        forbid_extra_fields?: boolean | undefined;
        frozen?: boolean | undefined;
        orm_mode?: boolean | undefined;
        require_optional_fields?: boolean | undefined;
        skip_validation?: boolean | undefined;
        smart_union?: boolean | undefined;
        use_provided_defaults?: boolean | undefined;
        use_string_enums?: boolean | undefined;
        version_compatibility?: "v1" | "v2" | "both" | "v1_on_v2" | undefined;
        wrapped_aliases?: boolean | undefined;
    },
    {
        package_name?: string | undefined;
        enum_type?: "literals" | "forward_compatible_python_enums" | "python_enums" | undefined;
        include_union_utils?: boolean | undefined;
        union_naming?: "v0" | "v1" | undefined;
        coerce_numbers_to_str?: boolean | undefined;
        extra_fields?: "allow" | "forbid" | "ignore" | undefined;
        include_validators?: boolean | undefined;
        skip_formatting?: boolean | undefined;
        forbid_extra_fields?: boolean | undefined;
        frozen?: boolean | undefined;
        orm_mode?: boolean | undefined;
        require_optional_fields?: boolean | undefined;
        skip_validation?: boolean | undefined;
        smart_union?: boolean | undefined;
        use_provided_defaults?: boolean | undefined;
        use_string_enums?: boolean | undefined;
        version_compatibility?: "v1" | "v2" | "both" | "v1_on_v2" | undefined;
        wrapped_aliases?: boolean | undefined;
    }
> = z.object({
    // Influence dynamic snippets.
    enum_type: z.enum(["literals", "forward_compatible_python_enums", "python_enums"]).optional().default("literals"),
    include_union_utils: z.boolean().optional().default(false),
    union_naming: z.enum(["v0", "v1"]).optional().default("v0"),

    // General options.
    coerce_numbers_to_str: z.boolean().optional(),
    extra_fields: z.enum(["allow", "forbid", "ignore"]).optional(),
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
    version_compatibility: z.enum(["v1", "v2", "both", "v1_on_v2"]).optional(),
    wrapped_aliases: z.boolean().optional()
});

export type PydanticConfig = z.infer<typeof PydanticConfig>;
