# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "fern_oauth_client_credentials_environment_variables"
  spec.version = "0.0.1"
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
  spec.add_dependency "async-http-faraday", ">= 0.0", "< 1.0"
  spec.add_dependency "faraday", ">= 1.10", "< 3.0"
  spec.add_dependency "faraday-net_http", ">= 1.0", "< 4.0"
  spec.add_dependency "faraday-retry", ">= 1.0", "< 3.0"
end
