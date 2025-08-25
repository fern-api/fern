# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_websocket_bearer_auth_client"
  spec.version = SeedWebsocketBearerAuthClient::Gemconfig::VERSION
  spec.authors = SeedWebsocketBearerAuthClient::Gemconfig::AUTHORS
  spec.email = SeedWebsocketBearerAuthClient::Gemconfig::EMAIL
  spec.summary = SeedWebsocketBearerAuthClient::Gemconfig::SUMMARY
  spec.description = SeedWebsocketBearerAuthClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedWebsocketBearerAuthClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedWebsocketBearerAuthClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedWebsocketBearerAuthClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
