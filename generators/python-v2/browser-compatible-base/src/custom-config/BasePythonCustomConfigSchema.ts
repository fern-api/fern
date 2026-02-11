import { z } from "zod";

import { BaseDependencyConfig } from "./BaseDependencyConfig";
import { ClientConfig } from "./ClientConfig";
import { DependencyConfig } from "./DependencyConfig";
import { ModuleExport } from "./ModuleExport";
import { PydanticConfig } from "./PydanticConfig";

export const BasePythonCustomConfigSchema: z.ZodObject<
    {
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
        improved_imports: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        package_name: z.ZodOptional<z.ZodString>;
        pydantic_config: z.ZodOptional<
            z.ZodObject<
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
            >
        >;
        use_typeddict_requests: z.ZodOptional<z.ZodBoolean>;
        additional_init_exports: z.ZodOptional<
            z.ZodArray<
                z.ZodObject<
                    { from: z.ZodOptional<z.ZodString>; imports: z.ZodOptional<z.ZodArray<z.ZodString, "many">> },
                    "strip",
                    z.ZodTypeAny,
                    { from?: string | undefined; imports?: Array<string> | undefined },
                    { from?: string | undefined; imports?: Array<string> | undefined }
                >,
                "many"
            >
        >;
        default_bytes_stream_chunk_size: z.ZodOptional<z.ZodNumber>;
        extra_dependencies: z.ZodOptional<
            z.ZodRecord<
                z.ZodString,
                z.ZodUnion<
                    [
                        z.ZodString,
                        z.ZodObject<
                            { version: z.ZodString; extras: z.ZodOptional<z.ZodArray<z.ZodString, "many">> } & {
                                python: z.ZodOptional<z.ZodString>;
                                optional: z.ZodOptional<z.ZodBoolean>;
                            },
                            "strip",
                            z.ZodTypeAny,
                            {
                                version: string;
                                optional?: boolean | undefined;
                                extras?: Array<string> | undefined;
                                python?: string | undefined;
                            },
                            {
                                version: string;
                                optional?: boolean | undefined;
                                extras?: Array<string> | undefined;
                                python?: string | undefined;
                            }
                        >
                    ]
                >
            >
        >;
        extra_dev_dependencies: z.ZodOptional<
            z.ZodRecord<
                z.ZodString,
                z.ZodUnion<
                    [
                        z.ZodString,
                        z.ZodObject<
                            { version: z.ZodString; extras: z.ZodOptional<z.ZodArray<z.ZodString, "many">> },
                            "strip",
                            z.ZodTypeAny,
                            { version: string; extras?: Array<string> | undefined },
                            { version: string; extras?: Array<string> | undefined }
                        >
                    ]
                >
            >
        >;
        extras: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
        follow_redirects_by_default: z.ZodOptional<z.ZodBoolean>;
        pyproject_python_version: z.ZodOptional<z.ZodString>;
        pyproject_toml: z.ZodOptional<z.ZodString>;
        should_generate_websocket_clients: z.ZodOptional<z.ZodBoolean>;
        skip_formatting: z.ZodOptional<z.ZodBoolean>;
        timeout_in_seconds: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"infinity">, z.ZodNumber]>>;
        client_class_name: z.ZodOptional<z.ZodString>;
        client_filename: z.ZodOptional<z.ZodString>;
        flat_layout: z.ZodOptional<z.ZodBoolean>;
        include_legacy_wire_tests: z.ZodOptional<z.ZodBoolean>;
        inline_request_params: z.ZodOptional<z.ZodBoolean>;
        use_api_name_in_package: z.ZodOptional<z.ZodBoolean>;
    },
    "strip",
    z.ZodTypeAny,
    {
        improved_imports: boolean;
        client?:
            | {
                  filename?: string | undefined;
                  class_name?: string | undefined;
                  exported_filename?: string | undefined;
                  exported_class_name?: string | undefined;
              }
            | undefined;
        extras?: Record<string, Array<string>> | undefined;
        package_name?: string | undefined;
        skip_formatting?: boolean | undefined;
        pydantic_config?:
            | {
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
              }
            | undefined;
        use_typeddict_requests?: boolean | undefined;
        additional_init_exports?: Array<{ from?: string | undefined; imports?: Array<string> | undefined }> | undefined;
        default_bytes_stream_chunk_size?: number | undefined;
        extra_dependencies?:
            | Record<
                  string,
                  | string
                  | {
                        version: string;
                        optional?: boolean | undefined;
                        extras?: Array<string> | undefined;
                        python?: string | undefined;
                    }
              >
            | undefined;
        extra_dev_dependencies?:
            | Record<string, string | { version: string; extras?: Array<string> | undefined }>
            | undefined;
        follow_redirects_by_default?: boolean | undefined;
        pyproject_python_version?: string | undefined;
        pyproject_toml?: string | undefined;
        should_generate_websocket_clients?: boolean | undefined;
        timeout_in_seconds?: number | "infinity" | undefined;
        client_class_name?: string | undefined;
        client_filename?: string | undefined;
        flat_layout?: boolean | undefined;
        include_legacy_wire_tests?: boolean | undefined;
        inline_request_params?: boolean | undefined;
        use_api_name_in_package?: boolean | undefined;
    },
    {
        client?:
            | {
                  filename?: string | undefined;
                  class_name?: string | undefined;
                  exported_filename?: string | undefined;
                  exported_class_name?: string | undefined;
              }
            | undefined;
        extras?: Record<string, Array<string>> | undefined;
        improved_imports?: boolean | undefined;
        package_name?: string | undefined;
        skip_formatting?: boolean | undefined;
        pydantic_config?:
            | {
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
            | undefined;
        use_typeddict_requests?: boolean | undefined;
        additional_init_exports?: Array<{ from?: string | undefined; imports?: Array<string> | undefined }> | undefined;
        default_bytes_stream_chunk_size?: number | undefined;
        extra_dependencies?:
            | Record<
                  string,
                  | string
                  | {
                        version: string;
                        optional?: boolean | undefined;
                        extras?: Array<string> | undefined;
                        python?: string | undefined;
                    }
              >
            | undefined;
        extra_dev_dependencies?:
            | Record<string, string | { version: string; extras?: Array<string> | undefined }>
            | undefined;
        follow_redirects_by_default?: boolean | undefined;
        pyproject_python_version?: string | undefined;
        pyproject_toml?: string | undefined;
        should_generate_websocket_clients?: boolean | undefined;
        timeout_in_seconds?: number | "infinity" | undefined;
        client_class_name?: string | undefined;
        client_filename?: string | undefined;
        flat_layout?: boolean | undefined;
        include_legacy_wire_tests?: boolean | undefined;
        inline_request_params?: boolean | undefined;
        use_api_name_in_package?: boolean | undefined;
    }
> = z.object({
    // Influence dynamic snippets.
    client: ClientConfig.optional(),
    improved_imports: z.boolean().optional().default(true),
    package_name: z.string().optional(),
    pydantic_config: PydanticConfig.optional(),
    use_typeddict_requests: z.boolean().optional(),

    // General options.
    additional_init_exports: z.array(ModuleExport).optional(),
    default_bytes_stream_chunk_size: z.number().optional(),
    extra_dependencies: z.record(z.string(), z.union([z.string(), DependencyConfig])).optional(),
    extra_dev_dependencies: z.record(z.string(), z.union([z.string(), BaseDependencyConfig])).optional(),
    extras: z.record(z.string(), z.array(z.string())).optional(),
    follow_redirects_by_default: z.boolean().optional(),
    pyproject_python_version: z.string().optional(),
    pyproject_toml: z.string().optional(),
    should_generate_websocket_clients: z.boolean().optional(),
    skip_formatting: z.boolean().optional(),
    timeout_in_seconds: z.union([z.literal("infinity"), z.number()]).optional(),

    // Deprecated.
    client_class_name: z.string().optional(),
    client_filename: z.string().optional(),
    flat_layout: z.boolean().optional(),
    include_legacy_wire_tests: z.boolean().optional(),
    inline_request_params: z.boolean().optional(),
    use_api_name_in_package: z.boolean().optional()
});

export type BasePythonCustomConfigSchema = z.infer<typeof BasePythonCustomConfigSchema>;
