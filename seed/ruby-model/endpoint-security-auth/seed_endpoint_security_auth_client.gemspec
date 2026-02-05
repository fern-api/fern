# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_endpoint_security_auth_client"
  spec.version = SeedEndpointSecurityAuthClient::Gemconfig::VERSION
  spec.authors = SeedEndpointSecurityAuthClient::Gemconfig::AUTHORS
  spec.email = SeedEndpointSecurityAuthClient::Gemconfig::EMAIL
  spec.summary = SeedEndpointSecurityAuthClient::Gemconfig::SUMMARY
  spec.description = SeedEndpointSecurityAuthClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedEndpointSecurityAuthClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedEndpointSecurityAuthClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedEndpointSecurityAuthClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
