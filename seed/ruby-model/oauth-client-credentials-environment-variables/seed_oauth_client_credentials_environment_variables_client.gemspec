# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_oauth_client_credentials_environment_variables_client"
  spec.version = SeedOauthClientCredentialsEnvironmentVariablesClient::Gemconfig::VERSION
  spec.authors = SeedOauthClientCredentialsEnvironmentVariablesClient::Gemconfig::AUTHORS
  spec.email = SeedOauthClientCredentialsEnvironmentVariablesClient::Gemconfig::EMAIL
  spec.summary = SeedOauthClientCredentialsEnvironmentVariablesClient::Gemconfig::SUMMARY
  spec.description = SeedOauthClientCredentialsEnvironmentVariablesClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedOauthClientCredentialsEnvironmentVariablesClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedOauthClientCredentialsEnvironmentVariablesClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedOauthClientCredentialsEnvironmentVariablesClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
