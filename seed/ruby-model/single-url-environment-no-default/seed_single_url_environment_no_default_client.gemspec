# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_single_url_environment_no_default_client"
  spec.version = SeedSingleUrlEnvironmentNoDefaultClient::Gemconfig::VERSION
  spec.authors = SeedSingleUrlEnvironmentNoDefaultClient::Gemconfig::AUTHORS
  spec.email = SeedSingleUrlEnvironmentNoDefaultClient::Gemconfig::EMAIL
  spec.summary = SeedSingleUrlEnvironmentNoDefaultClient::Gemconfig::SUMMARY
  spec.description = SeedSingleUrlEnvironmentNoDefaultClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedSingleUrlEnvironmentNoDefaultClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedSingleUrlEnvironmentNoDefaultClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedSingleUrlEnvironmentNoDefaultClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
