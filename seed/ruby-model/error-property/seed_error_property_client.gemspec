# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_error_property_client"
  spec.version = SeedErrorPropertyClient::Gemconfig::VERSION
  spec.authors = SeedErrorPropertyClient::Gemconfig::AUTHORS
  spec.email = SeedErrorPropertyClient::Gemconfig::EMAIL
  spec.summary = SeedErrorPropertyClient::Gemconfig::SUMMARY
  spec.description = SeedErrorPropertyClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedErrorPropertyClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedErrorPropertyClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedErrorPropertyClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
