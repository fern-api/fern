# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_auth_environment_variables_client"
  spec.version = SeedAuthEnvironmentVariablesClient::Gemconfig::VERSION
  spec.authors = SeedAuthEnvironmentVariablesClient::Gemconfig::AUTHORS
  spec.email = SeedAuthEnvironmentVariablesClient::Gemconfig::EMAIL
  spec.summary = SeedAuthEnvironmentVariablesClient::Gemconfig::SUMMARY
  spec.description = SeedAuthEnvironmentVariablesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedAuthEnvironmentVariablesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedAuthEnvironmentVariablesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedAuthEnvironmentVariablesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
