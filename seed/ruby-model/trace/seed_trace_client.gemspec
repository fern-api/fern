# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_trace_client"
  spec.version = SeedTraceClient::Gemconfig::VERSION
  spec.authors = SeedTraceClient::Gemconfig::AUTHORS
  spec.email = SeedTraceClient::Gemconfig::EMAIL
  spec.summary = SeedTraceClient::Gemconfig::SUMMARY
  spec.description = SeedTraceClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedTraceClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedTraceClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedTraceClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
