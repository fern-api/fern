# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_version_client"
  spec.version = SeedVersionClient::Gemconfig::VERSION
  spec.authors = SeedVersionClient::Gemconfig::AUTHORS
  spec.email = SeedVersionClient::Gemconfig::EMAIL
  spec.summary = SeedVersionClient::Gemconfig::SUMMARY
  spec.description = SeedVersionClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedVersionClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedVersionClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedVersionClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
