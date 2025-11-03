# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_undiscriminated_union_with_response_property_client"
  spec.version = SeedUndiscriminatedUnionWithResponsePropertyClient::Gemconfig::VERSION
  spec.authors = SeedUndiscriminatedUnionWithResponsePropertyClient::Gemconfig::AUTHORS
  spec.email = SeedUndiscriminatedUnionWithResponsePropertyClient::Gemconfig::EMAIL
  spec.summary = SeedUndiscriminatedUnionWithResponsePropertyClient::Gemconfig::SUMMARY
  spec.description = SeedUndiscriminatedUnionWithResponsePropertyClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedUndiscriminatedUnionWithResponsePropertyClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedUndiscriminatedUnionWithResponsePropertyClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedUndiscriminatedUnionWithResponsePropertyClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
