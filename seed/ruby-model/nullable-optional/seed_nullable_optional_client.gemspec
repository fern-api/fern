# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_nullable_optional_client"
  spec.version = SeedNullableOptionalClient::Gemconfig::VERSION
  spec.authors = SeedNullableOptionalClient::Gemconfig::AUTHORS
  spec.email = SeedNullableOptionalClient::Gemconfig::EMAIL
  spec.summary = SeedNullableOptionalClient::Gemconfig::SUMMARY
  spec.description = SeedNullableOptionalClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedNullableOptionalClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedNullableOptionalClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedNullableOptionalClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
