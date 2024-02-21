# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_unknown_as_any_client"
  spec.version = SeedUnknownAsAnyClient::Gemconfig::VERSION
  spec.authors = SeedUnknownAsAnyClient::Gemconfig::AUTHORS
  spec.email = SeedUnknownAsAnyClient::Gemconfig::EMAIL
  spec.summary = SeedUnknownAsAnyClient::Gemconfig::SUMMARY
  spec.description = SeedUnknownAsAnyClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedUnknownAsAnyClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedUnknownAsAnyClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedUnknownAsAnyClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
