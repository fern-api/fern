# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_query_parameters_client"
  spec.version = SeedQueryParametersClient::Gemconfig::VERSION
  spec.authors = SeedQueryParametersClient::Gemconfig::AUTHORS
  spec.email = SeedQueryParametersClient::Gemconfig::EMAIL
  spec.summary = SeedQueryParametersClient::Gemconfig::SUMMARY
  spec.description = SeedQueryParametersClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedQueryParametersClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedQueryParametersClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedQueryParametersClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
