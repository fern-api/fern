# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_streaming_client"
  spec.version = SeedStreamingClient::Gemconfig::VERSION
  spec.authors = SeedStreamingClient::Gemconfig::AUTHORS
  spec.email = SeedStreamingClient::Gemconfig::EMAIL
  spec.summary = SeedStreamingClient::Gemconfig::SUMMARY
  spec.description = SeedStreamingClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedStreamingClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedStreamingClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedStreamingClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
