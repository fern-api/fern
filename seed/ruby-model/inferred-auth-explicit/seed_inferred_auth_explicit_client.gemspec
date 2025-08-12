# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_inferred_auth_explicit_client"
  spec.version = SeedInferredAuthExplicitClient::Gemconfig::VERSION
  spec.authors = SeedInferredAuthExplicitClient::Gemconfig::AUTHORS
  spec.email = SeedInferredAuthExplicitClient::Gemconfig::EMAIL
  spec.summary = SeedInferredAuthExplicitClient::Gemconfig::SUMMARY
  spec.description = SeedInferredAuthExplicitClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedInferredAuthExplicitClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedInferredAuthExplicitClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedInferredAuthExplicitClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
