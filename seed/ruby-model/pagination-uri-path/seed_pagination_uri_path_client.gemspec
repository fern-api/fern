# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_pagination_uri_path_client"
  spec.version = SeedPaginationUriPathClient::Gemconfig::VERSION
  spec.authors = SeedPaginationUriPathClient::Gemconfig::AUTHORS
  spec.email = SeedPaginationUriPathClient::Gemconfig::EMAIL
  spec.summary = SeedPaginationUriPathClient::Gemconfig::SUMMARY
  spec.description = SeedPaginationUriPathClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedPaginationUriPathClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedPaginationUriPathClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedPaginationUriPathClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
