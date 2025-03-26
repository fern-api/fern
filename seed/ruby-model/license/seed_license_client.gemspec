# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_license_client"
  spec.version = SeedLicenseClient::Gemconfig::VERSION
  spec.authors = SeedLicenseClient::Gemconfig::AUTHORS
  spec.email = SeedLicenseClient::Gemconfig::EMAIL
  spec.summary = SeedLicenseClient::Gemconfig::SUMMARY
  spec.description = SeedLicenseClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedLicenseClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedLicenseClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedLicenseClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
