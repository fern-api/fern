# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_bearer_token_environment_variable_client"
  spec.version = "0.0.1"
  spec.authors = SeedBearerTokenEnvironmentVariableClient::Gemconfig::AUTHORS
  spec.email = SeedBearerTokenEnvironmentVariableClient::Gemconfig::EMAIL
  spec.summary = SeedBearerTokenEnvironmentVariableClient::Gemconfig::SUMMARY
  spec.description = SeedBearerTokenEnvironmentVariableClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedBearerTokenEnvironmentVariableClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedBearerTokenEnvironmentVariableClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedBearerTokenEnvironmentVariableClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
  spec.add_dependency "async-http-faraday", ">= 0.0", "< 1.0"
  spec.add_dependency "faraday", ">= 1.10", "< 3.0"
  spec.add_dependency "faraday-net_http", ">= 1.0", "< 4.0"
  spec.add_dependency "faraday-retry", ">= 1.0", "< 3.0"
end
