# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_api_client"
  spec.version = SeedApiClient::Gemconfig::VERSION
  spec.authors = SeedApiClient::Gemconfig::AUTHORS
  spec.email = SeedApiClient::Gemconfig::EMAIL
  spec.summary = SeedApiClient::Gemconfig::SUMMARY
  spec.description = SeedApiClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedApiClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedApiClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedApiClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
