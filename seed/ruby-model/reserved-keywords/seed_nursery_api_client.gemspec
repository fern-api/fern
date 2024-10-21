# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_nursery_api_client"
  spec.version = SeedNurseryApiClient::Gemconfig::VERSION
  spec.authors = SeedNurseryApiClient::Gemconfig::AUTHORS
  spec.email = SeedNurseryApiClient::Gemconfig::EMAIL
  spec.summary = SeedNurseryApiClient::Gemconfig::SUMMARY
  spec.description = SeedNurseryApiClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedNurseryApiClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedNurseryApiClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedNurseryApiClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
