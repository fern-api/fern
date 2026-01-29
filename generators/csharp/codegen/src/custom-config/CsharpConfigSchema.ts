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
export const OutputPathSchema = z.union([
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

export const CsharpConfigSchema = z.object({
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
