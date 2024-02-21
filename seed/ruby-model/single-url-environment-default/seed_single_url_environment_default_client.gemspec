# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_single_url_environment_default_client"
  spec.version = SeedSingleUrlEnvironmentDefaultClient::Gemconfig::VERSION
  spec.authors = SeedSingleUrlEnvironmentDefaultClient::Gemconfig::AUTHORS
  spec.email = SeedSingleUrlEnvironmentDefaultClient::Gemconfig::EMAIL
  spec.summary = SeedSingleUrlEnvironmentDefaultClient::Gemconfig::SUMMARY
  spec.description = SeedSingleUrlEnvironmentDefaultClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedSingleUrlEnvironmentDefaultClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedSingleUrlEnvironmentDefaultClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedSingleUrlEnvironmentDefaultClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
