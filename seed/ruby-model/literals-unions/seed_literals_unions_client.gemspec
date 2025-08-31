# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_literals_unions_client"
  spec.version = SeedLiteralsUnionsClient::Gemconfig::VERSION
  spec.authors = SeedLiteralsUnionsClient::Gemconfig::AUTHORS
  spec.email = SeedLiteralsUnionsClient::Gemconfig::EMAIL
  spec.summary = SeedLiteralsUnionsClient::Gemconfig::SUMMARY
  spec.description = SeedLiteralsUnionsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedLiteralsUnionsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedLiteralsUnionsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedLiteralsUnionsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
