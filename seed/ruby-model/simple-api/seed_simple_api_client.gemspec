# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_simple_api_client"
  spec.version = SeedSimpleApiClient::Gemconfig::VERSION
  spec.authors = SeedSimpleApiClient::Gemconfig::AUTHORS
  spec.email = SeedSimpleApiClient::Gemconfig::EMAIL
  spec.summary = SeedSimpleApiClient::Gemconfig::SUMMARY
  spec.description = SeedSimpleApiClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedSimpleApiClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedSimpleApiClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedSimpleApiClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
