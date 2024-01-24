# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "SeedClient"
  spec.version = SeedClient::Gemconfig::VERSION
  spec.authors = SeedClient::Gemconfig::AUTHORS
  spec.email = SeedClient::Gemconfig::EMAIL
  spec.summary = SeedClient::Gemconfig::SUMMARY
  spec.description = SeedClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
