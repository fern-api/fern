import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

export const BaseJavaCustomConfigSchema: z.ZodObject<
    {
        "base-api-exception-class-name": z.ZodOptional<z.ZodString>;
        "base-exception-class-name": z.ZodOptional<z.ZodString>;
        "client-class-name": z.ZodOptional<z.ZodString>;
        "inline-file-properties": z.ZodOptional<z.ZodBoolean>;
        "inline-path-parameters": z.ZodOptional<z.ZodBoolean>;
        "package-layout": z.ZodOptional<z.ZodEnum<["flat", "nested"]>>;
        "package-prefix": z.ZodOptional<z.ZodString>;
        "use-local-date-for-dates": z.ZodOptional<z.ZodBoolean>;
        "custom-dependencies": z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        "disable-required-property-builder-checks": z.ZodOptional<z.ZodBoolean>;
        "enable-forward-compatible-enums": z.ZodOptional<z.ZodBoolean>;
        "enable-inline-types": z.ZodOptional<z.ZodBoolean>;
        "enable-public-constructors": z.ZodOptional<z.ZodBoolean>;
        "generate-unknown-as-json-node": z.ZodOptional<z.ZodBoolean>;
        "json-include": z.ZodOptional<z.ZodEnum<["non-absent", "non-empty"]>>;
        "enable-extensible-builders": z.ZodOptional<z.ZodBoolean>;
        "use-default-request-parameter-values": z.ZodOptional<z.ZodBoolean>;
        "enable-wire-tests": z.ZodDefault<z.ZodBoolean>;
        "collapse-optional-nullable": z.ZodOptional<z.ZodBoolean>;
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
        "custom-pager-name": z.ZodOptional<z.ZodString>;
        "default-timeout-in-seconds": z.ZodOptional<z.ZodNumber>;
        "gradle-distribution-url": z.ZodOptional<z.ZodString>;
        "gradle-plugin-management": z.ZodOptional<z.ZodString>;
        "gradle-central-dependency-management": z.ZodOptional<z.ZodBoolean>;
        "output-directory": z.ZodOptional<z.ZodEnum<["source-root", "project-root"]>>;
        "enable-gradle-profiling": z.ZodOptional<z.ZodBoolean>;
        "wrapped-aliases": z.ZodOptional<z.ZodBoolean>;
    },
    "strip",
    z.ZodTypeAny,
    {
        "enable-wire-tests": boolean;
        "client-class-name"?: string | undefined;
        "base-api-exception-class-name"?: string | undefined;
        "base-exception-class-name"?: string | undefined;
        "inline-file-properties"?: boolean | undefined;
        "inline-path-parameters"?: boolean | undefined;
        "package-layout"?: "flat" | "nested" | undefined;
        "package-prefix"?: string | undefined;
        "use-local-date-for-dates"?: boolean | undefined;
        "custom-dependencies"?: Array<string> | undefined;
        "disable-required-property-builder-checks"?: boolean | undefined;
        "enable-forward-compatible-enums"?: boolean | undefined;
        "enable-inline-types"?: boolean | undefined;
        "enable-public-constructors"?: boolean | undefined;
        "generate-unknown-as-json-node"?: boolean | undefined;
        "json-include"?: "non-absent" | "non-empty" | undefined;
        "enable-extensible-builders"?: boolean | undefined;
        "use-default-request-parameter-values"?: boolean | undefined;
        "collapse-optional-nullable"?: boolean | undefined;
        "custom-readme-sections"?: Array<{ title: string; content: string }> | undefined;
        "custom-pager-name"?: string | undefined;
        "default-timeout-in-seconds"?: number | undefined;
        "gradle-distribution-url"?: string | undefined;
        "gradle-plugin-management"?: string | undefined;
        "gradle-central-dependency-management"?: boolean | undefined;
        "output-directory"?: "source-root" | "project-root" | undefined;
        "enable-gradle-profiling"?: boolean | undefined;
        "wrapped-aliases"?: boolean | undefined;
    },
    {
        "client-class-name"?: string | undefined;
        "base-api-exception-class-name"?: string | undefined;
        "base-exception-class-name"?: string | undefined;
        "inline-file-properties"?: boolean | undefined;
        "inline-path-parameters"?: boolean | undefined;
        "package-layout"?: "flat" | "nested" | undefined;
        "package-prefix"?: string | undefined;
        "use-local-date-for-dates"?: boolean | undefined;
        "custom-dependencies"?: Array<string> | undefined;
        "disable-required-property-builder-checks"?: boolean | undefined;
        "enable-forward-compatible-enums"?: boolean | undefined;
        "enable-inline-types"?: boolean | undefined;
        "enable-public-constructors"?: boolean | undefined;
        "generate-unknown-as-json-node"?: boolean | undefined;
        "json-include"?: "non-absent" | "non-empty" | undefined;
        "enable-extensible-builders"?: boolean | undefined;
        "use-default-request-parameter-values"?: boolean | undefined;
        "enable-wire-tests"?: boolean | undefined;
        "collapse-optional-nullable"?: boolean | undefined;
        "custom-readme-sections"?: Array<{ title: string; content: string }> | undefined;
        "custom-pager-name"?: string | undefined;
        "default-timeout-in-seconds"?: number | undefined;
        "gradle-distribution-url"?: string | undefined;
        "gradle-plugin-management"?: string | undefined;
        "gradle-central-dependency-management"?: boolean | undefined;
        "output-directory"?: "source-root" | "project-root" | undefined;
        "enable-gradle-profiling"?: boolean | undefined;
        "wrapped-aliases"?: boolean | undefined;
    }
> = z.object({
    // Influences dynamic snippets.
    "base-api-exception-class-name": z.string().optional(),
    "base-exception-class-name": z.string().optional(),
    "client-class-name": z.string().optional(),
    "inline-file-properties": z.boolean().optional(),
    "inline-path-parameters": z.boolean().optional(),
    "package-layout": z.enum(["flat", "nested"]).optional(),
    "package-prefix": z.string().optional(),
    "use-local-date-for-dates": z.boolean().optional(),

    // General options.
    "custom-dependencies": z.array(z.string()).optional(),
    "disable-required-property-builder-checks": z.boolean().optional(),
    "enable-forward-compatible-enums": z.boolean().optional(),
    "enable-inline-types": z.boolean().optional(),
    "enable-public-constructors": z.boolean().optional(),
    "generate-unknown-as-json-node": z.boolean().optional(),
    "json-include": z.enum(["non-absent", "non-empty"]).optional(),
    "enable-extensible-builders": z.boolean().optional(),
    "use-default-request-parameter-values": z.boolean().optional(),
    "enable-wire-tests": z.boolean().default(false),
    "collapse-optional-nullable": z.boolean().optional(),
    "custom-readme-sections": z.array(CustomReadmeSectionSchema).optional(),
    "custom-pager-name": z.string().optional(),
    "default-timeout-in-seconds": z.number().optional(),
    "gradle-distribution-url": z.string().optional(),
    "gradle-plugin-management": z.string().optional(),
    "gradle-central-dependency-management": z.boolean().optional(),
    "output-directory": z.enum(["source-root", "project-root"]).optional(),

    // Hidden options (for debugging).
    "enable-gradle-profiling": z.boolean().optional(),

    // Deprecated.
    "wrapped-aliases": z.boolean().optional()
});

export type BaseJavaCustomConfigSchema = z.infer<typeof BaseJavaCustomConfigSchema>;
