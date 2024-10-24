# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_cross_package_type_names_client"
  spec.version = SeedCrossPackageTypeNamesClient::Gemconfig::VERSION
  spec.authors = SeedCrossPackageTypeNamesClient::Gemconfig::AUTHORS
  spec.email = SeedCrossPackageTypeNamesClient::Gemconfig::EMAIL
  spec.summary = SeedCrossPackageTypeNamesClient::Gemconfig::SUMMARY
  spec.description = SeedCrossPackageTypeNamesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedCrossPackageTypeNamesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedCrossPackageTypeNamesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedCrossPackageTypeNamesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
