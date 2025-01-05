import { camelCase, snakeCase, upperFirst } from "lodash-es";

import { RelativeFilePath } from "@fern-api/fs-utils";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { BasicLicense, CustomLicense } from "@fern-fern/generator-exec-sdk/api";
import { FernFilepath } from "@fern-fern/ir-sdk/api";

import { ExternalDependency } from "../ast/ExternalDependency";
import { Module_ } from "../ast/Module_";
import { Expression } from "../ast/expressions/Expression";
import { Gemspec } from "../ast/gem/Gemspec";
import { GeneratedFile } from "./GeneratedFile";
import { GeneratedRubyFile } from "./GeneratedRubyFile";

export const MINIMUM_RUBY_VERSION = "2.7";

export function getGemName(organization: string, apiName: string, clientClassName?: string, gemName?: string): string {
    return gemName != null ? snakeCase(gemName) : snakeCase(getClientName(organization, apiName, clientClassName));
}

export function getClientName(organization: string, apiName: string, clientClassName?: string): string {
    return clientClassName ?? upperFirst(camelCase(organization)) + upperFirst(camelCase(apiName)) + "Client";
}

export function getBreadcrumbsFromFilepath(
    fernFilepath: FernFilepath,
    clientName: string,
    includeFullPath?: boolean
): string[] {
    return [
        clientName,
        ...(includeFullPath === true ? fernFilepath.allParts : fernFilepath.packagePath).map(
            (pathPart) => pathPart.pascalCase.safeName
        )
    ];
}

export function generateBasicRakefile(): GeneratedFile {
    const content = `# frozen_string_literal: true
require "rake/testtask"
require "rubocop/rake_task"

task default: %i[test rubocop]

Rake::TestTask.new do |t|
    t.pattern = "./test/**/test_*.rb"
end
    
RuboCop::RakeTask.new   
`;
    return new GeneratedFile("Rakefile", RelativeFilePath.of("."), content);
}

// These tests are so static + basic that I didn't go through the trouble of leveraging the AST
export function generateBasicTests(gemName: string, clientName: string): GeneratedFile[] {
    const helperContent = `# frozen_string_literal: true

$LOAD_PATH.unshift File.expand_path("../lib", __dir__)

require "minitest/autorun"
require "${gemName}"
`;
    const helperFile = new GeneratedFile("test_helper.rb", RelativeFilePath.of("test/"), helperContent);

    const testContent = `# frozen_string_literal: true
require_relative "test_helper"
require "${gemName}"

# Basic ${clientName} tests
class Test${clientName} < Minitest::Test
  def test_function
    # ${clientName}::Client.new
  end
end`;
    const testFile = new GeneratedFile(`test_${gemName}.rb`, RelativeFilePath.of("test/"), testContent);

    return [helperFile, testFile];
}

export function generateGemspec(
    clientName: string,
    gemName: string,
    extraDependencies: ExternalDependency[],
    sdkVersion?: string,
    licenseConfig?: FernGeneratorExec.LicenseConfig,
    hasFileBasedDependencies = false,
    hasEndpoints = false
): GeneratedRubyFile {
    const license = licenseConfig?._visit({
        basic: (l: BasicLicense) => {
            return { licenseType: l.id, licenseFilePath: "LICENSE" };
        },
        custom: (l: CustomLicense) => {
            return { licenseFilePath: l.filename };
        },
        _other: () => {
            throw new Error("Unknown license configuration provided.");
        }
    });
    const gemspec = new Gemspec({
        clientName,
        gemName,
        dependencies: extraDependencies,
        sdkVersion,
        license,
        hasFileBasedDependencies,
        hasEndpoints
    });
    return new GeneratedRubyFile({
        rootNode: gemspec,
        fullPath: gemName,
        fileExtension: "gemspec",
        isConfigurationFile: true
    });
}

// To ensure configuration may be managed independently from dependenies, we introduce a new config file that
// users are encouraged to fernignore and update, while allowing the traditional gemspec to remain generated
export function generateGemConfig(clientName: string, repoUrl?: string): GeneratedRubyFile {
    const gemspec = new Module_({
        name: clientName,
        child: new Module_({
            name: "Gemconfig",
            child: [
                new Expression({ leftSide: "VERSION", rightSide: '""', isAssignment: true }),
                new Expression({ leftSide: "AUTHORS", rightSide: '[""].freeze', isAssignment: true }),
                new Expression({ leftSide: "EMAIL", rightSide: '""', isAssignment: true }),
                new Expression({ leftSide: "SUMMARY", rightSide: '""', isAssignment: true }),
                new Expression({ leftSide: "DESCRIPTION", rightSide: '""', isAssignment: true }),
                // Input some placeholders for installation to work
                new Expression({
                    leftSide: "HOMEPAGE",
                    rightSide: `"${repoUrl ?? "https://github.com/REPO/URL"}"`,
                    isAssignment: true
                }),
                new Expression({
                    leftSide: "SOURCE_CODE_URI",
                    rightSide: `"${repoUrl ?? "https://github.com/REPO/URL"}"`,
                    isAssignment: true
                }),
                new Expression({
                    leftSide: "CHANGELOG_URI",
                    rightSide: `"${repoUrl ?? "https://github.com/REPO/URL"}/blob/master/CHANGELOG.md"`,
                    isAssignment: true
                })
            ]
        })
    });
    return new GeneratedRubyFile({
        rootNode: gemspec,
        fullPath: "gemconfig"
    });
}

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

export function generateGithubWorkflow(gemName: string, registryUrl: string, apiKeyEnvVar: string): GeneratedFile {
    const content = `name: Publish

on: [push]
jobs:
    publish:
        if: github.event_name == 'push' && contains(github.ref, 'refs/tags/')
        runs-on: ubuntu-latest
        steps:
          - name: Checkout repo
            uses: actions/checkout@v3

          - uses: ruby/setup-ruby@v1
            with:
              ruby-version: 2.7
              bundler-cache: true

          - name: Test gem
            run: bundle install && bundle exec rake test
              
          - name: Build and Push Gem
            env:
              GEM_HOST_API_KEY: \${{ secrets.${apiKeyEnvVar} }}
            run: |
              gem build ${gemName}.gemspec

              gem push ${gemName}-*.gem --host ${registryUrl}
`;
    return new GeneratedFile("publish.yml", RelativeFilePath.of(".github/workflows"), content);
}

export function generateRubocopConfig(): GeneratedFile {
    const content = `AllCops:
  TargetRubyVersion: ${MINIMUM_RUBY_VERSION}
  
Style/StringLiterals:
  Enabled: true
  EnforcedStyle: double_quotes
  
Style/StringLiteralsInInterpolation:
  Enabled: true
  EnforcedStyle: double_quotes

Layout/FirstHashElementLineBreak:
  Enabled: true

Layout/MultilineHashKeyLineBreaks:
  Enabled: true

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
export function generateGemfile(extraDevDependencies: ExternalDependency[]): GeneratedFile {
    let gemfileContent = `# frozen_string_literal: true

source "https://rubygems.org"

gemspec

gem "minitest", "~> 5.0"
gem "rake", "~> 13.0"
gem "rubocop", "~> 1.21"
`;

    if (extraDevDependencies.length > 0) {
        gemfileContent += "\n";
        for (const dep of extraDevDependencies) {
            gemfileContent += `gem ${dep.write({})}\n`;
        }
    }
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
