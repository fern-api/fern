import { BaseRubyCustomConfigSchema } from "@fern-api/ruby-ast";

import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext.js";

export declare namespace RubocopFile {
    interface Args {
        context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;
    }
}

export class RubocopFile {
    private context: AbstractRubyGeneratorContext<BaseRubyCustomConfigSchema>;

    constructor({ context }: RubocopFile.Args) {
        this.context = context;
    }

    private getVariableNumberConfig(): string {
        const style = this.context.customConfig.rubocopVariableNumberStyle ?? "normalcase";

        if (style === "disabled") {
            return `Naming/VariableNumber:
  Enabled: false`;
        }

        const severity = this.context.customConfig.rubocopSeverity ?? "warning";

        return `Naming/VariableNumber:
  EnforcedStyle: ${style}
  Severity: ${severity}`;
    }

    public async toString(): Promise<string> {
        return `plugins:
  - rubocop-minitest

AllCops:
  TargetRubyVersion: 3.3
  NewCops: enable

Style/StringLiterals:
  EnforcedStyle: double_quotes

Style/StringLiteralsInInterpolation:
  EnforcedStyle: double_quotes

Style/AccessModifierDeclarations:
  Enabled: false

Lint/ConstantDefinitionInBlock:
  Enabled: false

Metrics/AbcSize:
  Enabled: false

Metrics/BlockLength:
  Enabled: false

Metrics/ClassLength:
  Enabled: false

Metrics/MethodLength:
  Enabled: false

Metrics/ParameterLists:
  Enabled: false

Metrics/PerceivedComplexity:
  Enabled: false

Metrics/CyclomaticComplexity:
  Enabled: false

Metrics/ModuleLength:
  Enabled: false

Layout/LineLength:
  Enabled: false

${this.getVariableNumberConfig()}

Style/Documentation:
  Enabled: false

Style/Lambda:
  EnforcedStyle: literal

Minitest/MultipleAssertions:
  Enabled: false

Minitest/UselessAssertion:
  Enabled: false

# Dynamic snippets are code samples for documentation, not standalone Ruby files.
Style/FrozenStringLiteralComment:
  Exclude:
    - "dynamic-snippets/**/*"

# Indent hash elements 2 spaces from the start of the enclosing line rather than
# aligning with the preceding paren or bracket. Generated code nests hashes inside
# arrays and method calls; the "consistent" style is more readable there.
Layout/FirstHashElementIndentation:
  EnforcedStyle: consistent
  Exclude:
    - "dynamic-snippets/**/*"

# Match Layout/FirstHashElementIndentation: indent the first argument 2 spaces
# from the start of the method call's line, regardless of parenthesis position.
Layout/FirstArgumentIndentation:
  EnforcedStyle: consistent

# The generator emits non-idiomatic class names (e.g. Get_With_Query, JSON_)
# derived from IR type names whose wire form contains underscores or digits.
# Rubocop never auto-corrected these (naming cops have no autocorrecter), so
# disabling the cop keeps CI green without changing customer output. Fixing at
# source would rename public types across every existing SDK and therefore
# requires a ruby-v2 major-version bump with a generator migration.
Naming/ClassAndModuleCamelCase:
  Enabled: false
`;
    }
}
