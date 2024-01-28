# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_idempotency_headers_client"
  spec.version = SeedIdempotencyHeadersClient::Gemconfig::VERSION
  spec.authors = SeedIdempotencyHeadersClient::Gemconfig::AUTHORS
  spec.email = SeedIdempotencyHeadersClient::Gemconfig::EMAIL
  spec.summary = SeedIdempotencyHeadersClient::Gemconfig::SUMMARY
  spec.description = SeedIdempotencyHeadersClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedIdempotencyHeadersClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedIdempotencyHeadersClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedIdempotencyHeadersClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
