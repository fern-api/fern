# frozen_string_literal: true

require "test_helper"

# WireMock container lifecycle management for wire tests.
# This file is the Ruby equivalent of Python's conftest.py for wire tests.
# It automatically starts the WireMock container before tests and stops it after.

WIREMOCK_COMPOSE_FILE = File.expand_path("../../wiremock/docker-compose.test.yml", __dir__)

# Start WireMock container when this file is required
if ENV["RUN_WIRE_TESTS"] == "true" && File.exist?(WIREMOCK_COMPOSE_FILE)
  puts "Starting WireMock container..."
  warn "Failed to start WireMock container" unless system("docker compose -f #{WIREMOCK_COMPOSE_FILE} up -d --wait")

  # Stop WireMock container after all tests complete
  Minitest.after_run do
    puts "Stopping WireMock container..."
    system("docker compose -f #{WIREMOCK_COMPOSE_FILE} down")
  end
end
