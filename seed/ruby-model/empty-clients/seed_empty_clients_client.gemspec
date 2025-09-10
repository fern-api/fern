# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_empty_clients_client"
  spec.version = SeedEmptyClientsClient::Gemconfig::VERSION
  spec.authors = SeedEmptyClientsClient::Gemconfig::AUTHORS
  spec.email = SeedEmptyClientsClient::Gemconfig::EMAIL
  spec.summary = SeedEmptyClientsClient::Gemconfig::SUMMARY
  spec.description = SeedEmptyClientsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedEmptyClientsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedEmptyClientsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedEmptyClientsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
