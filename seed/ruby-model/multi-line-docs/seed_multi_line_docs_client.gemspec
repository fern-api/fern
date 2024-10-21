# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_multi_line_docs_client"
  spec.version = SeedMultiLineDocsClient::Gemconfig::VERSION
  spec.authors = SeedMultiLineDocsClient::Gemconfig::AUTHORS
  spec.email = SeedMultiLineDocsClient::Gemconfig::EMAIL
  spec.summary = SeedMultiLineDocsClient::Gemconfig::SUMMARY
  spec.description = SeedMultiLineDocsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedMultiLineDocsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedMultiLineDocsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedMultiLineDocsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
