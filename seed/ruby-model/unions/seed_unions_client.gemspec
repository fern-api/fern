# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_unions_client"
  spec.version = SeedUnionsClient::Gemconfig::VERSION
  spec.authors = SeedUnionsClient::Gemconfig::AUTHORS
  spec.email = SeedUnionsClient::Gemconfig::EMAIL
  spec.summary = SeedUnionsClient::Gemconfig::SUMMARY
  spec.description = SeedUnionsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedUnionsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedUnionsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedUnionsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
