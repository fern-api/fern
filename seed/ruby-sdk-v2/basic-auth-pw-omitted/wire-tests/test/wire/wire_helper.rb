# frozen_string_literal: true

require "test_helper"

# WireMock container lifecycle management for wire tests.
# It automatically starts the WireMock container before tests and stops it after.
# If WIREMOCK_URL is already set (external orchestration), container management is skipped.

WIREMOCK_COMPOSE_FILE = File.expand_path("../../wiremock/docker-compose.test.yml", __dir__)

# Start WireMock container when this file is required
if ENV["RUN_WIRE_TESTS"] == "true" && File.exist?(WIREMOCK_COMPOSE_FILE) && !ENV["WIREMOCK_URL"]
  puts "Starting WireMock container..."
  warn "Failed to start WireMock container" unless system("docker compose -f #{WIREMOCK_COMPOSE_FILE} up -d --wait")

  # Discover the dynamically assigned port and set WIREMOCK_URL
  port_output = `docker compose -f #{WIREMOCK_COMPOSE_FILE} port wiremock 8080 2>&1`.strip
  if port_output =~ /:(\d+)$/
    ENV["WIREMOCK_URL"] = "http://localhost:#{Regexp.last_match(1)}"
    puts "WireMock container is ready at #{ENV.fetch("WIREMOCK_URL", nil)}"
  else
    ENV["WIREMOCK_URL"] = "http://localhost:8080"
    puts "WireMock container is ready (default port 8080)"
  end

  # Stop WireMock container after all tests complete
  Minitest.after_run do
    puts "Stopping WireMock container..."
    system("docker compose -f #{WIREMOCK_COMPOSE_FILE} down")
  end
end
