# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_plain_text_client"
  spec.version = SeedPlainTextClient::Gemconfig::VERSION
  spec.authors = SeedPlainTextClient::Gemconfig::AUTHORS
  spec.email = SeedPlainTextClient::Gemconfig::EMAIL
  spec.summary = SeedPlainTextClient::Gemconfig::SUMMARY
  spec.description = SeedPlainTextClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedPlainTextClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedPlainTextClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedPlainTextClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
