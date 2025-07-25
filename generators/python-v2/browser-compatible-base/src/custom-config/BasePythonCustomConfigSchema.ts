import { z } from "zod";

import { BaseDependencyConfig } from "./BaseDependencyConfig";
import { ClientConfig } from "./ClientConfig";
import { DependencyConfig } from "./DependencyConfig";
import { ModuleExport } from "./ModuleExport";
import { PydanticConfig } from "./PydanticConfig";

export const BasePythonCustomConfigSchema = z.object({
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
    should_generate_wire_tests: z.boolean().optional(),
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
