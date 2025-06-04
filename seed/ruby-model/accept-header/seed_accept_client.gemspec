# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_accept_client"
  spec.version = SeedAcceptClient::Gemconfig::VERSION
  spec.authors = SeedAcceptClient::Gemconfig::AUTHORS
  spec.email = SeedAcceptClient::Gemconfig::EMAIL
  spec.summary = SeedAcceptClient::Gemconfig::SUMMARY
  spec.description = SeedAcceptClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedAcceptClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedAcceptClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedAcceptClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
