# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_no_retries_client"
  spec.version = SeedNoRetriesClient::Gemconfig::VERSION
  spec.authors = SeedNoRetriesClient::Gemconfig::AUTHORS
  spec.email = SeedNoRetriesClient::Gemconfig::EMAIL
  spec.summary = SeedNoRetriesClient::Gemconfig::SUMMARY
  spec.description = SeedNoRetriesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedNoRetriesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedNoRetriesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedNoRetriesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
