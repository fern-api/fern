import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext";

export declare namespace RubocopFile {
    interface Args {
        context: AbstractRubyGeneratorContext<object>;
    }
}

export class RubocopFile {
    private context: AbstractRubyGeneratorContext<object>;

    constructor({ context }: RubocopFile.Args) {
        this.context = context;
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

Style/Documentation:
  Enabled: false

Minitest/MultipleAssertions:
  Enabled: false

Minitest/UselessAssertion:
  Enabled: false
`;
    }
}
