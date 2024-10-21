# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_bytes_client"
  spec.version = SeedBytesClient::Gemconfig::VERSION
  spec.authors = SeedBytesClient::Gemconfig::AUTHORS
  spec.email = SeedBytesClient::Gemconfig::EMAIL
  spec.summary = SeedBytesClient::Gemconfig::SUMMARY
  spec.description = SeedBytesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedBytesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedBytesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedBytesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
