# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_errors_client"
  spec.version = SeedErrorsClient::Gemconfig::VERSION
  spec.authors = SeedErrorsClient::Gemconfig::AUTHORS
  spec.email = SeedErrorsClient::Gemconfig::EMAIL
  spec.summary = SeedErrorsClient::Gemconfig::SUMMARY
  spec.description = SeedErrorsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedErrorsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedErrorsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedErrorsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
