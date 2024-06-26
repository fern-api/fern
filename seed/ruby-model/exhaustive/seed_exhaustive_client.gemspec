# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_exhaustive_client"
  spec.version = SeedExhaustiveClient::Gemconfig::VERSION
  spec.authors = SeedExhaustiveClient::Gemconfig::AUTHORS
  spec.email = SeedExhaustiveClient::Gemconfig::EMAIL
  spec.summary = SeedExhaustiveClient::Gemconfig::SUMMARY
  spec.description = SeedExhaustiveClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedExhaustiveClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedExhaustiveClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedExhaustiveClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
