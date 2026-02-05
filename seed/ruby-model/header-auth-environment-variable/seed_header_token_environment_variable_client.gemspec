# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_header_token_environment_variable_client"
  spec.version = SeedHeaderTokenEnvironmentVariableClient::Gemconfig::VERSION
  spec.authors = SeedHeaderTokenEnvironmentVariableClient::Gemconfig::AUTHORS
  spec.email = SeedHeaderTokenEnvironmentVariableClient::Gemconfig::EMAIL
  spec.summary = SeedHeaderTokenEnvironmentVariableClient::Gemconfig::SUMMARY
  spec.description = SeedHeaderTokenEnvironmentVariableClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedHeaderTokenEnvironmentVariableClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedHeaderTokenEnvironmentVariableClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedHeaderTokenEnvironmentVariableClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
