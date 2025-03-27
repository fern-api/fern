# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_content_types_client"
  spec.version = SeedContentTypesClient::Gemconfig::VERSION
  spec.authors = SeedContentTypesClient::Gemconfig::AUTHORS
  spec.email = SeedContentTypesClient::Gemconfig::EMAIL
  spec.summary = SeedContentTypesClient::Gemconfig::SUMMARY
  spec.description = SeedContentTypesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedContentTypesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedContentTypesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedContentTypesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
