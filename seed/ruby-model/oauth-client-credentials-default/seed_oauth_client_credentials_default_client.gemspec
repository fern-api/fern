# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_oauth_client_credentials_default_client"
  spec.version = SeedOauthClientCredentialsDefaultClient::Gemconfig::VERSION
  spec.authors = SeedOauthClientCredentialsDefaultClient::Gemconfig::AUTHORS
  spec.email = SeedOauthClientCredentialsDefaultClient::Gemconfig::EMAIL
  spec.summary = SeedOauthClientCredentialsDefaultClient::Gemconfig::SUMMARY
  spec.description = SeedOauthClientCredentialsDefaultClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedOauthClientCredentialsDefaultClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedOauthClientCredentialsDefaultClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedOauthClientCredentialsDefaultClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
