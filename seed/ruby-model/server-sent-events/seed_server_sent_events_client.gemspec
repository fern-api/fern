# frozen_string_literal: true

require_relative "lib/gemconfig"

Gem::Specification.new do |spec|
  spec.name = "seed_server_sent_events_client"
  spec.version = SeedServerSentEventsClient::Gemconfig::VERSION
  spec.authors = SeedServerSentEventsClient::Gemconfig::AUTHORS
  spec.email = SeedServerSentEventsClient::Gemconfig::EMAIL
  spec.summary = SeedServerSentEventsClient::Gemconfig::SUMMARY
  spec.description = SeedServerSentEventsClient::Gemconfig::DESCRIPTION
  spec.homepage = SeedServerSentEventsClient::Gemconfig::HOMEPAGE
  spec.required_ruby_version = ">= 2.7.0"
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = SeedServerSentEventsClient::Gemconfig::SOURCE_CODE_URI
  spec.metadata["changelog_uri"] = SeedServerSentEventsClient::Gemconfig::CHANGELOG_URI
  spec.files = Dir.glob("lib/**/*")
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
