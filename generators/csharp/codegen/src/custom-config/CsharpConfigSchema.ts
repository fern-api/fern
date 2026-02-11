import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

/**
 * Schema for configuring output paths for generated C# SDK files.
 *
 * Supports either a simple string (all files go to that path) or an object
 * with specific paths for library, test, solution, and other files.
 *
 * Examples:
 * - Simple: `outputPath: src`
 * - Object: `outputPath: { library: path/to/src/ApiLib, test: path/to/test/ApiLib.Test }`
 */
export const OutputPathSchema: z.ZodUnion<
    [
        z.ZodString,
        z.ZodObject<
            {
                library: z.ZodOptional<z.ZodString>;
                test: z.ZodOptional<z.ZodString>;
                solution: z.ZodOptional<z.ZodString>;
                other: z.ZodOptional<z.ZodString>;
            },
            "strip",
            z.ZodTypeAny,
            {
                other?: string | undefined;
                test?: string | undefined;
                library?: string | undefined;
                solution?: string | undefined;
            },
            {
                other?: string | undefined;
                test?: string | undefined;
                library?: string | undefined;
                solution?: string | undefined;
            }
        >
    ]
> = z.union([
    z.string(),
    z.object({
        /** Path for the library project (e.g., "src" or "path/to/src/ApiLib") */
        library: z.string().optional(),
        /** Path for the test project (e.g., "src" or "path/to/test/ApiLib.Test") */
        test: z.string().optional(),
        /** Path for the solution file (e.g., "." or "path/to") */
        solution: z.string().optional(),
        /** Path for other files like README.md and reference.md (e.g., "." or "path/to/src/ApiLib") */
        other: z.string().optional()
    })
]);

export type OutputPathSchema = z.infer<typeof OutputPathSchema>;

export const CsharpConfigSchema: z.ZodObject<
    {
        namespace: z.ZodOptional<z.ZodString>;
        "base-api-exception-class-name": z.ZodOptional<z.ZodString>;
        "simplify-object-dictionaries": z.ZodOptional<z.ZodBoolean>;
        "base-exception-class-name": z.ZodOptional<z.ZodString>;
        "client-class-name": z.ZodOptional<z.ZodString>;
        "environment-class-name": z.ZodOptional<z.ZodString>;
        "exported-client-class-name": z.ZodOptional<z.ZodString>;
        "explicit-namespaces": z.ZodOptional<z.ZodBoolean>;
        "inline-path-parameters": z.ZodOptional<z.ZodBoolean>;
        "read-only-memory-types": z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        "root-namespace-for-core-classes": z.ZodOptional<z.ZodBoolean>;
        "use-discriminated-unions": z.ZodOptional<z.ZodBoolean>;
        "use-undiscriminated-unions": z.ZodOptional<z.ZodBoolean>;
        "experimental-fully-qualified-namespaces": z.ZodOptional<z.ZodBoolean>;
        "experimental-dotnet-format": z.ZodOptional<z.ZodBoolean>;
        "experimental-enable-websockets": z.ZodOptional<z.ZodBoolean>;
        "experimental-readonly-constants": z.ZodOptional<z.ZodBoolean>;
        "experimental-explicit-nullable-optional": z.ZodOptional<z.ZodBoolean>;
        "use-default-request-parameter-values": z.ZodOptional<z.ZodBoolean>;
        "temporary-websocket-environments": z.ZodOptional<
            z.ZodRecord<
                z.ZodString,
                z.ZodObject<
                    {
                        "default-environment": z.ZodOptional<z.ZodString>;
                        environments: z.ZodRecord<z.ZodString, z.ZodString>;
                    },
                    "strip",
                    z.ZodTypeAny,
                    { environments: Record<string, string>; "default-environment"?: string | undefined },
                    { environments: Record<string, string>; "default-environment"?: string | undefined }
                >
            >
        >;
        "output-path": z.ZodOptional<
            z.ZodUnion<
                [
                    z.ZodString,
                    z.ZodObject<
                        {
                            library: z.ZodOptional<z.ZodString>;
                            test: z.ZodOptional<z.ZodString>;
                            solution: z.ZodOptional<z.ZodString>;
                            other: z.ZodOptional<z.ZodString>;
                        },
                        "strip",
                        z.ZodTypeAny,
                        {
                            other?: string | undefined;
                            test?: string | undefined;
                            library?: string | undefined;
                            solution?: string | undefined;
                        },
                        {
                            other?: string | undefined;
                            test?: string | undefined;
                            library?: string | undefined;
                            solution?: string | undefined;
                        }
                    >
                ]
            >
        >;
        "root-client-class-access": z.ZodOptional<z.ZodEnum<["public", "internal"]>>;
        "custom-pager-name": z.ZodOptional<z.ZodString>;
        "enable-forward-compatible-enums": z.ZodOptional<z.ZodBoolean>;
        "generate-error-types": z.ZodOptional<z.ZodBoolean>;
        "package-id": z.ZodOptional<z.ZodString>;
        "generate-mock-server-tests": z.ZodOptional<z.ZodBoolean>;
        "enable-wire-tests": z.ZodOptional<z.ZodBoolean>;
        "include-exception-handler": z.ZodOptional<z.ZodBoolean>;
        "exception-interceptor-class-name": z.ZodOptional<z.ZodString>;
        "custom-readme-sections": z.ZodOptional<
            z.ZodArray<
                z.ZodObject<
                    { title: z.ZodString; content: z.ZodString },
                    "strict",
                    z.ZodTypeAny,
                    { title: string; content: string },
                    { title: string; content: string }
                >,
                "many"
            >
        >;
        "extra-dependencies": z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        "pascal-case-environments": z.ZodOptional<z.ZodBoolean>;
        "experimental-enable-forward-compatible-enums": z.ZodOptional<z.ZodBoolean>;
    },
    "strip",
    z.ZodTypeAny,
    {
        namespace?: string | undefined;
        "client-class-name"?: string | undefined;
        "base-api-exception-class-name"?: string | undefined;
        "base-exception-class-name"?: string | undefined;
        "inline-path-parameters"?: boolean | undefined;
        "enable-forward-compatible-enums"?: boolean | undefined;
        "use-default-request-parameter-values"?: boolean | undefined;
        "enable-wire-tests"?: boolean | undefined;
        "custom-readme-sections"?: Array<{ title: string; content: string }> | undefined;
        "custom-pager-name"?: string | undefined;
        "simplify-object-dictionaries"?: boolean | undefined;
        "environment-class-name"?: string | undefined;
        "exported-client-class-name"?: string | undefined;
        "explicit-namespaces"?: boolean | undefined;
        "read-only-memory-types"?: Array<string> | undefined;
        "root-namespace-for-core-classes"?: boolean | undefined;
        "use-discriminated-unions"?: boolean | undefined;
        "use-undiscriminated-unions"?: boolean | undefined;
        "experimental-fully-qualified-namespaces"?: boolean | undefined;
        "experimental-dotnet-format"?: boolean | undefined;
        "experimental-enable-websockets"?: boolean | undefined;
        "experimental-readonly-constants"?: boolean | undefined;
        "experimental-explicit-nullable-optional"?: boolean | undefined;
        "temporary-websocket-environments"?:
            | Record<string, { environments: Record<string, string>; "default-environment"?: string | undefined }>
            | undefined;
        "output-path"?:
            | string
            | {
                  other?: string | undefined;
                  test?: string | undefined;
                  library?: string | undefined;
                  solution?: string | undefined;
              }
            | undefined;
        "root-client-class-access"?: "public" | "internal" | undefined;
        "generate-error-types"?: boolean | undefined;
        "package-id"?: string | undefined;
        "generate-mock-server-tests"?: boolean | undefined;
        "include-exception-handler"?: boolean | undefined;
        "exception-interceptor-class-name"?: string | undefined;
        "extra-dependencies"?: Record<string, string> | undefined;
        "pascal-case-environments"?: boolean | undefined;
        "experimental-enable-forward-compatible-enums"?: boolean | undefined;
    },
    {
        namespace?: string | undefined;
        "client-class-name"?: string | undefined;
        "base-api-exception-class-name"?: string | undefined;
        "base-exception-class-name"?: string | undefined;
        "inline-path-parameters"?: boolean | undefined;
        "enable-forward-compatible-enums"?: boolean | undefined;
        "use-default-request-parameter-values"?: boolean | undefined;
        "enable-wire-tests"?: boolean | undefined;
        "custom-readme-sections"?: Array<{ title: string; content: string }> | undefined;
        "custom-pager-name"?: string | undefined;
        "simplify-object-dictionaries"?: boolean | undefined;
        "environment-class-name"?: string | undefined;
        "exported-client-class-name"?: string | undefined;
        "explicit-namespaces"?: boolean | undefined;
        "read-only-memory-types"?: Array<string> | undefined;
        "root-namespace-for-core-classes"?: boolean | undefined;
        "use-discriminated-unions"?: boolean | undefined;
        "use-undiscriminated-unions"?: boolean | undefined;
        "experimental-fully-qualified-namespaces"?: boolean | undefined;
        "experimental-dotnet-format"?: boolean | undefined;
        "experimental-enable-websockets"?: boolean | undefined;
        "experimental-readonly-constants"?: boolean | undefined;
        "experimental-explicit-nullable-optional"?: boolean | undefined;
        "temporary-websocket-environments"?:
            | Record<string, { environments: Record<string, string>; "default-environment"?: string | undefined }>
            | undefined;
        "output-path"?:
            | string
            | {
                  other?: string | undefined;
                  test?: string | undefined;
                  library?: string | undefined;
                  solution?: string | undefined;
              }
            | undefined;
        "root-client-class-access"?: "public" | "internal" | undefined;
        "generate-error-types"?: boolean | undefined;
        "package-id"?: string | undefined;
        "generate-mock-server-tests"?: boolean | undefined;
        "include-exception-handler"?: boolean | undefined;
        "exception-interceptor-class-name"?: string | undefined;
        "extra-dependencies"?: Record<string, string> | undefined;
        "pascal-case-environments"?: boolean | undefined;
        "experimental-enable-forward-compatible-enums"?: boolean | undefined;
    }
> = z.object({
    // Influence dynamic snippets.
    namespace: z.string().optional(),
    "base-api-exception-class-name": z.string().optional(),
    "simplify-object-dictionaries": z.boolean().optional(),
    "base-exception-class-name": z.string().optional(),
    "client-class-name": z.string().optional(),
    "environment-class-name": z.string().optional(),
    "exported-client-class-name": z.string().optional(),
    "explicit-namespaces": z.boolean().optional(),
    "inline-path-parameters": z.boolean().optional(),
    "read-only-memory-types": z.optional(z.array(z.string())),
    "root-namespace-for-core-classes": z.boolean().optional(),
    "use-discriminated-unions": z.boolean().optional(),
    "use-undiscriminated-unions": z.boolean().optional(),
    "experimental-fully-qualified-namespaces": z.boolean().optional(),
    "experimental-dotnet-format": z.boolean().optional(),

    // new experimental options
    "experimental-enable-websockets": z.boolean().optional(),
    "experimental-readonly-constants": z.boolean().optional(),
    "experimental-explicit-nullable-optional": z.boolean().optional(),
    "use-default-request-parameter-values": z.boolean().optional(),

    // temporary options to unblock websocket URIs generation
    //
    // example
    // temporary-websocket-environments:
    //   '/stream/input':       # channel path
    //      default-environment: 'prod'  # name used in
    //      environments:
    //        'prod': 'wss://api.company.com/foo/bar'
    //        'dev': 'wss://dev.api.company.com/v2/foo/bar'
    //
    // or for a service that doesn't define an environment name
    // like the websocket fixture, use an empty string as the environment name
    // temporary-websocket-environments:
    //   '/realtime/':
    //      environments:
    //        '': 'wss://api.company.com/foo/bar'

    "temporary-websocket-environments": z
        .record(
            z.object({
                "default-environment": z.string().optional(),
                environments: z.record(z.string())
            })
        )
        .optional(),

    // Output path configuration.
    // Supports either a simple string (all files go to that path) or an object
    // with specific paths for library, test, solution, and other files.
    "output-path": OutputPathSchema.optional(),

    // General options.
    "root-client-class-access": z.enum(["public", "internal"]).optional(),
    "custom-pager-name": z.string().optional(),
    "enable-forward-compatible-enums": z.boolean().optional(),
    "generate-error-types": z.boolean().optional(),
    "package-id": z.string().optional(),
    "generate-mock-server-tests": z.boolean().optional(),
    "enable-wire-tests": z.boolean().optional(),
    "include-exception-handler": z.boolean().optional(),
    "exception-interceptor-class-name": z.string().optional(),
    "custom-readme-sections": z.array(CustomReadmeSectionSchema).optional(),

    // Deprecated.
    "extra-dependencies": z
        .record(z.string())
        .optional()
        .describe(
            "(Deprecated) The extra dependencies to add into the csproj file. Use the [ProjectName].Custom.props to configure additional dependencies instead."
        ),
    "pascal-case-environments": z.boolean().optional(),

    "experimental-enable-forward-compatible-enums": z.boolean().optional()
});

export type CsharpConfigSchema = z.infer<typeof CsharpConfigSchema>;
