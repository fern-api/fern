# frozen_string_literal: true

Gem::Specification.new() do | spec |
  spec.name = SeedClient::Gem::NAME
  spec.version = SeedClient::Gem::VERSION
  spec.authors = SeedClient::Gem::NAME
  spec.email = SeedClient::Gem::EMAIL
  spec.summary = SeedClient::Gem::SUMMARY
  spec.description = SeedClient::Gem::DESCRIPTION
  spec.homepage = SeedClient::Gem::HOMEPAGE
  spec.required_ruby_version = ">= 2.6.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedClient::Gem::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedClient::Gem::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*") << "LICENSE.md"
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end