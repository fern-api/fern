# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_multi_url_environment_no_default_client"
  spec.version = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::VERSION
  spec.authors = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::AUTHORS
  spec.email = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::EMAIL
  spec.summary = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::SUMMARY
  spec.description = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
