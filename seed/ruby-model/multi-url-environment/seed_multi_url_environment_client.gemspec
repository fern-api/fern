# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_multi_url_environment_client"
  spec.version = SeedMultiUrlEnvironmentClient::Gemconfig::VERSION
  spec.authors = SeedMultiUrlEnvironmentClient::Gemconfig::AUTHORS
  spec.email = SeedMultiUrlEnvironmentClient::Gemconfig::EMAIL
  spec.summary = SeedMultiUrlEnvironmentClient::Gemconfig::SUMMARY
  spec.description = SeedMultiUrlEnvironmentClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedMultiUrlEnvironmentClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedMultiUrlEnvironmentClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedMultiUrlEnvironmentClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
