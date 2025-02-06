# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "fern_nullable"
  spec.version = "0.0.1"
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
  spec.add_dependency "async-http-faraday", ">= 0.0", "< 1.0"
  spec.add_dependency "faraday", ">= 1.10", "< 3.0"
  spec.add_dependency "faraday-net_http", ">= 1.0", "< 4.0"
  spec.add_dependency "faraday-retry", ">= 1.0", "< 3.0"
end
