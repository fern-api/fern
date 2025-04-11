# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_public_object_client"
  spec.version = SeedPublicObjectClient::Gemconfig::VERSION
  spec.authors = SeedPublicObjectClient::Gemconfig::AUTHORS
  spec.email = SeedPublicObjectClient::Gemconfig::EMAIL
  spec.summary = SeedPublicObjectClient::Gemconfig::SUMMARY
  spec.description = SeedPublicObjectClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedPublicObjectClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedPublicObjectClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedPublicObjectClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
