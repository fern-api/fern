# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_oauth_client_credentials_with_variables_client"
  spec.version = SeedOauthClientCredentialsWithVariablesClient::Gemconfig::VERSION
  spec.authors = SeedOauthClientCredentialsWithVariablesClient::Gemconfig::AUTHORS
  spec.email = SeedOauthClientCredentialsWithVariablesClient::Gemconfig::EMAIL
  spec.summary = SeedOauthClientCredentialsWithVariablesClient::Gemconfig::SUMMARY
  spec.description = SeedOauthClientCredentialsWithVariablesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedOauthClientCredentialsWithVariablesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedOauthClientCredentialsWithVariablesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedOauthClientCredentialsWithVariablesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
