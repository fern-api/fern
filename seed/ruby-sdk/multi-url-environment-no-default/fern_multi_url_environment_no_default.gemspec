# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "fern_multi_url_environment_no_default"
  spec.version = "0.0.1"
  spec.authors = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::AUTHORS
  spec.email = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::EMAIL
  spec.summary = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::SUMMARY
  spec.description = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedMultiUrlEnvironmentNoDefaultClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
  spec.add_dependency "async-http-faraday", ">= 0.0", "< 1.0"
  spec.add_dependency "faraday", ">= 1.10", "< 3.0"
  spec.add_dependency "faraday-net_http", ">= 1.0", "< 4.0"
  spec.add_dependency "faraday-retry", ">= 1.0", "< 3.0"
end
