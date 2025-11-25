# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_header_token_client"
  spec.version = SeedHeaderTokenClient::Gemconfig::VERSION
  spec.authors = SeedHeaderTokenClient::Gemconfig::AUTHORS
  spec.email = SeedHeaderTokenClient::Gemconfig::EMAIL
  spec.summary = SeedHeaderTokenClient::Gemconfig::SUMMARY
  spec.description = SeedHeaderTokenClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedHeaderTokenClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedHeaderTokenClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedHeaderTokenClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
