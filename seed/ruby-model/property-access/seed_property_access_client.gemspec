# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_property_access_client"
  spec.version = SeedPropertyAccessClient::Gemconfig::VERSION
  spec.authors = SeedPropertyAccessClient::Gemconfig::AUTHORS
  spec.email = SeedPropertyAccessClient::Gemconfig::EMAIL
  spec.summary = SeedPropertyAccessClient::Gemconfig::SUMMARY
  spec.description = SeedPropertyAccessClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedPropertyAccessClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedPropertyAccessClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedPropertyAccessClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
