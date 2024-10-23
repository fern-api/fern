# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_validation_client"
  spec.version = SeedValidationClient::Gemconfig::VERSION
  spec.authors = SeedValidationClient::Gemconfig::AUTHORS
  spec.email = SeedValidationClient::Gemconfig::EMAIL
  spec.summary = SeedValidationClient::Gemconfig::SUMMARY
  spec.description = SeedValidationClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedValidationClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedValidationClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedValidationClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
