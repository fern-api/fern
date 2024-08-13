# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_any_auth_client"
  spec.version = SeedAnyAuthClient::Gemconfig::VERSION
  spec.authors = SeedAnyAuthClient::Gemconfig::AUTHORS
  spec.email = SeedAnyAuthClient::Gemconfig::EMAIL
  spec.summary = SeedAnyAuthClient::Gemconfig::SUMMARY
  spec.description = SeedAnyAuthClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedAnyAuthClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedAnyAuthClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedAnyAuthClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
