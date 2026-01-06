import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

export const RubocopVariableNumberStyleSchema = z.enum(["snake_case", "normalcase", "disabled"]);
export type RubocopVariableNumberStyle = z.infer<typeof RubocopVariableNumberStyleSchema>;

export const BaseRubyCustomConfigSchema = z.object({
    module: z.optional(z.string()),
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
    // RuboCop Naming/VariableNumber style for field names with numbers
    // - "snake_case": requires underscores before numbers (e.g., recaptcha_v_2) - default
    // - "normalcase": allows numbers without underscores (e.g., recaptcha_v2, office365)
    // - "disabled": disables the cop entirely
    rubocopVariableNumberStyle: z.optional(RubocopVariableNumberStyleSchema)
});

export type BaseRubyCustomConfigSchema = z.infer<typeof BaseRubyCustomConfigSchema>;
