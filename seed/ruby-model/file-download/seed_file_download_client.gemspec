# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_file_download_client"
  spec.version = SeedFileDownloadClient::Gemconfig::VERSION
  spec.authors = SeedFileDownloadClient::Gemconfig::AUTHORS
  spec.email = SeedFileDownloadClient::Gemconfig::EMAIL
  spec.summary = SeedFileDownloadClient::Gemconfig::SUMMARY
  spec.description = SeedFileDownloadClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedFileDownloadClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedFileDownloadClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedFileDownloadClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
