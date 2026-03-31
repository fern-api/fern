import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema.js";

export const BaseRubyCustomConfigSchema = z.object({
    // The Ruby module name used for folder structure and module naming (e.g., "Square" -> lib/square/, module Square)
    moduleName: z.optional(z.string()),
    clientModuleName: z.optional(z.string()),
    customReadmeSections: z.optional(z.array(CustomReadmeSectionSchema)),
    customPagerName: z.optional(z.string()),
    // Generate wire tests for serialization/deserialization
    enableWireTests: z.boolean().optional(),
    // Extra dependencies to add to the gemspec (e.g., { "my-gem": "~> 6.0" })
    extraDependencies: z.optional(z.record(z.string())),
    // Extra dev dependencies to add to the Gemfile (e.g., { "my-gem": "~> 6.0" })
    extraDevDependencies: z.optional(z.record(z.string())),
    // Paths to files that will be auto-loaded when the gem is required
    // (e.g., ["custom_integration", "sentry_integration"] will load lib/<gem>/custom_integration.rb
    // and lib/<gem>/sentry_integration.rb if they exist)
    requirePaths: z.optional(z.array(z.string())),
    // Apply IR-defined default values to query parameters and headers in request wrappers
    useDefaultRequestParameterValues: z.boolean().optional(),
    omitFernHeaders: z.boolean().optional(),
    // RuboCop Naming/VariableNumber style for field names with numbers
    // - "snake_case": requires underscores before numbers (e.g., recaptcha_v_2) - default
    // - "normalcase": allows numbers without underscores (e.g., recaptcha_v2, office365)
    // - "disabled": disables the cop entirely
    rubocopVariableNumberStyle: z.enum(["snake_case", "normalcase", "disabled"]).optional()
});

export type BaseRubyCustomConfigSchema = z.infer<typeof BaseRubyCustomConfigSchema>;
