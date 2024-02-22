# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_websocket_client"
  spec.version = SeedWebsocketClient::Gemconfig::VERSION
  spec.authors = SeedWebsocketClient::Gemconfig::AUTHORS
  spec.email = SeedWebsocketClient::Gemconfig::EMAIL
  spec.summary = SeedWebsocketClient::Gemconfig::SUMMARY
  spec.description = SeedWebsocketClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedWebsocketClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedWebsocketClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedWebsocketClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
