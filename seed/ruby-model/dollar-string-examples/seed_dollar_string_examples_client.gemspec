# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_dollar_string_examples_client"
  spec.version = SeedDollarStringExamplesClient::Gemconfig::VERSION
  spec.authors = SeedDollarStringExamplesClient::Gemconfig::AUTHORS
  spec.email = SeedDollarStringExamplesClient::Gemconfig::EMAIL
  spec.summary = SeedDollarStringExamplesClient::Gemconfig::SUMMARY
  spec.description = SeedDollarStringExamplesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedDollarStringExamplesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedDollarStringExamplesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedDollarStringExamplesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
