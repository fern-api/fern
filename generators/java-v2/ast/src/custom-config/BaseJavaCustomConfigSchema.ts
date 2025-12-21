import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

export const BaseJavaCustomConfigSchema = z.object({
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

    // Deprecated.
    "wrapped-aliases": z.boolean().optional()
});

export type BaseJavaCustomConfigSchema = z.infer<typeof BaseJavaCustomConfigSchema>;
