# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_bytes_upload_client"
  spec.version = SeedBytesUploadClient::Gemconfig::VERSION
  spec.authors = SeedBytesUploadClient::Gemconfig::AUTHORS
  spec.email = SeedBytesUploadClient::Gemconfig::EMAIL
  spec.summary = SeedBytesUploadClient::Gemconfig::SUMMARY
  spec.description = SeedBytesUploadClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedBytesUploadClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedBytesUploadClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedBytesUploadClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
