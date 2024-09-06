# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_mixed_file_directory_client"
  spec.version = SeedMixedFileDirectoryClient::Gemconfig::VERSION
  spec.authors = SeedMixedFileDirectoryClient::Gemconfig::AUTHORS
  spec.email = SeedMixedFileDirectoryClient::Gemconfig::EMAIL
  spec.summary = SeedMixedFileDirectoryClient::Gemconfig::SUMMARY
  spec.description = SeedMixedFileDirectoryClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedMixedFileDirectoryClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedMixedFileDirectoryClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedMixedFileDirectoryClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
