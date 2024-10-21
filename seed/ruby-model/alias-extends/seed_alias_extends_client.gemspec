# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_alias_extends_client"
  spec.version = SeedAliasExtendsClient::Gemconfig::VERSION
  spec.authors = SeedAliasExtendsClient::Gemconfig::AUTHORS
  spec.email = SeedAliasExtendsClient::Gemconfig::EMAIL
  spec.summary = SeedAliasExtendsClient::Gemconfig::SUMMARY
  spec.description = SeedAliasExtendsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedAliasExtendsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedAliasExtendsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedAliasExtendsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
