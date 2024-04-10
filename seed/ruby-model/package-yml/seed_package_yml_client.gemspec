# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_package_yml_client"
  spec.version = SeedPackageYmlClient::Gemconfig::VERSION
  spec.authors = SeedPackageYmlClient::Gemconfig::AUTHORS
  spec.email = SeedPackageYmlClient::Gemconfig::EMAIL
  spec.summary = SeedPackageYmlClient::Gemconfig::SUMMARY
  spec.description = SeedPackageYmlClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedPackageYmlClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedPackageYmlClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedPackageYmlClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
