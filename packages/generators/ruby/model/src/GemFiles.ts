import { RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratedFile } from "./utils/GeneratedFile";

export function generateGitignore(): GeneratedFile {
    const content = `/.bundle/
/.yardoc
/_yardoc/
/coverage/
/doc/
/pkg/
/spec/reports/
/tmp/
*.gem
.env
`;
    return new GeneratedFile(".gitignore", RelativeFilePath.of("."), content);
}

export function generateRubocopConfig(): GeneratedFile {
    const content = `AllCops:
  TargetRubyVersion: 2.6
  
Style/StringLiterals:
  Enabled: true
  EnforcedStyle: double_quotes
  
Style/StringLiteralsInInterpolation:
  Enabled: true
  EnforcedStyle: double_quotes

# Generated files may be more complex than standard, disable
# these rules for now as a known limitation.
Metrics/ParameterLists:
  Enabled: false

Metrics/MethodLength:
  Enabled: false

Metrics/AbcSize:
  Enabled: false

Metrics/ClassLength:
  Enabled: false

Metrics/CyclomaticComplexity:
  Enabled: false

Metrics/PerceivedComplexity:
  Enabled: false
`;
    return new GeneratedFile(".rubocop.yml", RelativeFilePath.of("."), content);
}

// TODO: this should probably be codified in a more intentional way
export function generateGemfile(): GeneratedFile {
    const gemfileContent = `# frozen_string_literal: true

source "https://rubygems.org"

gemspec

gem "minitest", "~> 5.0"
gem "rake", "~> 13.0"
gem "rubocop", "~> 1.21"
`;
    return new GeneratedFile("Gemfile", RelativeFilePath.of("."), gemfileContent);
}

export function generateBinDir(gemName: string): GeneratedFile[] {
    const setupContent = `#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
set -vx

bundle install
`;
    const setup = new GeneratedFile("setup", RelativeFilePath.of("bin"), setupContent);

    const consoleContent = `#!/usr/bin/env ruby
# frozen_string_literal: true

require "bundler/setup"
require "${gemName}"

# You can add fixtures and/or initialization code here to make experimenting
# with your gem easier. You can also use a different console, if you like.

# (If you use this, don't forget to add pry to your Gemfile!)
# require "pry"
# Pry.start

require "irb"
IRB.start(__FILE__)
`;
    const console = new GeneratedFile("setup", RelativeFilePath.of("bin"), consoleContent);

    return [setup, console];
}

export function generateReadme(): GeneratedFile {
    const content = "";
    return new GeneratedFile("README.md", RelativeFilePath.of("."), content);
}
