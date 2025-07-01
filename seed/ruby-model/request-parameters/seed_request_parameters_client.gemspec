# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_request_parameters_client"
  spec.version = SeedRequestParametersClient::Gemconfig::VERSION
  spec.authors = SeedRequestParametersClient::Gemconfig::AUTHORS
  spec.email = SeedRequestParametersClient::Gemconfig::EMAIL
  spec.summary = SeedRequestParametersClient::Gemconfig::SUMMARY
  spec.description = SeedRequestParametersClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedRequestParametersClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedRequestParametersClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedRequestParametersClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
