# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_pagination_client"
  spec.version = SeedPaginationClient::Gemconfig::VERSION
  spec.authors = SeedPaginationClient::Gemconfig::AUTHORS
  spec.email = SeedPaginationClient::Gemconfig::EMAIL
  spec.summary = SeedPaginationClient::Gemconfig::SUMMARY
  spec.description = SeedPaginationClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedPaginationClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedPaginationClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedPaginationClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
