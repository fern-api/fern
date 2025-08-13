# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_client_side_params_client"
  spec.version = SeedClientSideParamsClient::Gemconfig::VERSION
  spec.authors = SeedClientSideParamsClient::Gemconfig::AUTHORS
  spec.email = SeedClientSideParamsClient::Gemconfig::EMAIL
  spec.summary = SeedClientSideParamsClient::Gemconfig::SUMMARY
  spec.description = SeedClientSideParamsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedClientSideParamsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedClientSideParamsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedClientSideParamsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
