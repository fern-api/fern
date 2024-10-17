# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_response_property_client"
  spec.version = SeedResponsePropertyClient::Gemconfig::VERSION
  spec.authors = SeedResponsePropertyClient::Gemconfig::AUTHORS
  spec.email = SeedResponsePropertyClient::Gemconfig::EMAIL
  spec.summary = SeedResponsePropertyClient::Gemconfig::SUMMARY
  spec.description = SeedResponsePropertyClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedResponsePropertyClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedResponsePropertyClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedResponsePropertyClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
