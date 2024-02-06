# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_literal_headers_client"
  spec.version = SeedLiteralHeadersClient::Gemconfig::VERSION
  spec.authors = SeedLiteralHeadersClient::Gemconfig::AUTHORS
  spec.email = SeedLiteralHeadersClient::Gemconfig::EMAIL
  spec.summary = SeedLiteralHeadersClient::Gemconfig::SUMMARY
  spec.description = SeedLiteralHeadersClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedLiteralHeadersClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedLiteralHeadersClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedLiteralHeadersClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
  spec.add_dependency "async-http-faraday", "~> 0.12"
  spec.add_dependency "faraday", "~> 2.7"
  spec.add_dependency "faraday-retry", "~> 2.2"
end
