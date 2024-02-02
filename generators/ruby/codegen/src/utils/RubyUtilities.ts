import { RelativeFilePath } from "@fern-api/fs-utils";
import { DeclaredServiceName, DeclaredTypeName, FernFilepath } from "@fern-fern/ir-sdk/api";
import { camelCase, snakeCase, upperFirst } from "lodash-es";
import { Expression } from "../ast/expressions/Expression";
import { ExternalDependency } from "../ast/ExternalDependency";
import { Gemspec } from "../ast/gem/Gemspec";
import { Module_ } from "../ast/Module_";
import { GeneratedFile } from "./GeneratedFile";
import { GeneratedRubyFile } from "./GeneratedRubyFile";
import { TYPES_DIRECTORY } from "./RubyConstants";

export function getGemName(organization: string, apiName: string, clientClassName?: string, gemName?: string): string {
    return snakeCase(gemName ?? getClientName(organization, apiName, clientClassName));
}

export function getClientName(organization: string, apiName: string, clientClassName?: string): string {
    return clientClassName ?? upperFirst(camelCase(organization)) + upperFirst(camelCase(apiName)) + "Client";
}

export function getLocationForTypeDeclaration(declaredTypeName: DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.allParts.map((pathPart) => pathPart.snakeCase.safeName),
        TYPES_DIRECTORY,
        declaredTypeName.name.snakeCase.safeName
    ].join("/");
}

export function getLocationForServiceDeclaration(declaredServiceName: DeclaredServiceName): string {
    return [
        ...declaredServiceName.fernFilepath.packagePath.map((pathPart) => pathPart.snakeCase.safeName),
        declaredServiceName.fernFilepath.file?.snakeCase.safeName,
        "client"
    ]
        .filter((p) => p !== undefined)
        .join("/");
}

// Note: this assumes the file is in a directory of the same name
export function getLocationFromFernFilepath(fernFilepath: FernFilepath): string {
    return [...fernFilepath.allParts.map((pathPart) => pathPart.snakeCase.safeName)].join("/");
}

export function generateGemspec(
    clientName: string,
    gemName: string,
    extraDependencies: ExternalDependency[],
    sdkVersion?: string,
    hasFileBasedDependencies = false
): GeneratedRubyFile {
    const gemspec = new Gemspec({
        clientName,
        gemName,
        dependencies: extraDependencies,
        sdkVersion,
        hasFileBasedDependencies
    });
    return new GeneratedRubyFile({
        rootNode: gemspec,
        directoryPrefix: RelativeFilePath.of("."),
        name: `${gemName}`,
        fileExtension: "gemspec",
        isConfigurationFile: true
    });
}

// To ensure configuration may be managed independently from dependenies, we introduce a new config file that
// users are encouraged to fernignore and update, while allowing the traditional gemspec to remain generated
export function generateGemConfig(clientName: string): GeneratedRubyFile {
    const gemspec = new Module_({
        name: clientName,
        child: new Module_({
            name: "Gemconfig",
            child: [
                new Expression({ leftSide: "AUTHORS", rightSide: '[""].freeze', isAssignment: true }),
                new Expression({ leftSide: "EMAIL", rightSide: '""', isAssignment: true }),
                new Expression({ leftSide: "SUMMARY", rightSide: '""', isAssignment: true }),
                new Expression({ leftSide: "DESCRIPTION", rightSide: '""', isAssignment: true }),
                // Input some placeholders for installation to work
                new Expression({
                    leftSide: "HOMEPAGE",
                    rightSide: '"https://github.com/REPO/URL"',
                    isAssignment: true
                }),
                new Expression({
                    leftSide: "SOURCE_CODE_URI",
                    rightSide: '"https://github.com/REPO/URL"',
                    isAssignment: true
                }),
                new Expression({
                    leftSide: "CHANGELOG_URI",
                    rightSide: '"https://github.com/REPO/URL/blob/master/CHANGELOG.md"',
                    isAssignment: true
                })
            ]
        })
    });
    return new GeneratedRubyFile({
        rootNode: gemspec,
        directoryPrefix: RelativeFilePath.of("."),
        name: "gemconfig"
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

export function generateRubocopConfig(): GeneratedFile {
    const content = `AllCops:
  TargetRubyVersion: 2.7
  
Style/StringLiterals:
  Enabled: true
  EnforcedStyle: double_quotes

Style/RequireOrder:
  Enabled: true
  
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
