# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_oauth_client_credentials_reference_client"
  spec.version = SeedOauthClientCredentialsReferenceClient::Gemconfig::VERSION
  spec.authors = SeedOauthClientCredentialsReferenceClient::Gemconfig::AUTHORS
  spec.email = SeedOauthClientCredentialsReferenceClient::Gemconfig::EMAIL
  spec.summary = SeedOauthClientCredentialsReferenceClient::Gemconfig::SUMMARY
  spec.description = SeedOauthClientCredentialsReferenceClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedOauthClientCredentialsReferenceClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedOauthClientCredentialsReferenceClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedOauthClientCredentialsReferenceClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
