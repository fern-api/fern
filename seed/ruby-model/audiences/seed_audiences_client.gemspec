# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_audiences_client"
  spec.version = SeedAudiencesClient::Gemconfig::VERSION
  spec.authors = SeedAudiencesClient::Gemconfig::AUTHORS
  spec.email = SeedAudiencesClient::Gemconfig::EMAIL
  spec.summary = SeedAudiencesClient::Gemconfig::SUMMARY
  spec.description = SeedAudiencesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedAudiencesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedAudiencesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedAudiencesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
