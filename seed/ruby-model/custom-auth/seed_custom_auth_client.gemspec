# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_custom_auth_client"
  spec.version = SeedCustomAuthClient::Gemconfig::VERSION
  spec.authors = SeedCustomAuthClient::Gemconfig::AUTHORS
  spec.email = SeedCustomAuthClient::Gemconfig::EMAIL
  spec.summary = SeedCustomAuthClient::Gemconfig::SUMMARY
  spec.description = SeedCustomAuthClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedCustomAuthClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedCustomAuthClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedCustomAuthClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
