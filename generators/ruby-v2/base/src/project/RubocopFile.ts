import { BaseRubyCustomConfigSchema, RubocopVariableNumberStyle } from "@fern-api/ruby-ast";

import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext";

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
        const style: RubocopVariableNumberStyle = this.context.customConfig.rubocopVariableNumberStyle ?? "snake_case";

        if (style === "disabled") {
            return `Naming/VariableNumber:
  Enabled: false`;
        }

        return `Naming/VariableNumber:
  EnforcedStyle: ${style}`;
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
`;
    }
}
