# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_extends_client"
  spec.version = SeedExtendsClient::Gemconfig::VERSION
  spec.authors = SeedExtendsClient::Gemconfig::AUTHORS
  spec.email = SeedExtendsClient::Gemconfig::EMAIL
  spec.summary = SeedExtendsClient::Gemconfig::SUMMARY
  spec.description = SeedExtendsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedExtendsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedExtendsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedExtendsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
