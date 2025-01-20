# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_nullable_client"
  spec.version = SeedNullableClient::Gemconfig::VERSION
  spec.authors = SeedNullableClient::Gemconfig::AUTHORS
  spec.email = SeedNullableClient::Gemconfig::EMAIL
  spec.summary = SeedNullableClient::Gemconfig::SUMMARY
  spec.description = SeedNullableClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedNullableClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedNullableClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedNullableClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
