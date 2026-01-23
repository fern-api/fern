# frozen_string_literal: true

require "test_helper"
require_relative "wire_helper"
require "net/http"
require "json"
require "uri"
require "fern_examples"

# Base test case for WireMock-based wire tests.
#
# This class provides helper methods for verifying requests made to WireMock
# and manages the test lifecycle for integration tests.
class WireMockTestCase < Minitest::Test
  WIREMOCK_BASE_URL = "http://localhost:8080"
  WIREMOCK_ADMIN_URL = "http://localhost:8080/__admin"

  def setup
    super
    return if ENV["RUN_WIRE_TESTS"] == "true"

    skip "Wire tests are disabled by default. Set RUN_WIRE_TESTS=true to enable them."
  end

  # Verifies the number of requests made to WireMock filtered by test ID for concurrency safety.
  #
  # @param test_id [String] The test ID used to filter requests
  # @param method [String] The HTTP method (GET, POST, etc.)
  # @param url_path [String] The URL path to match
  # @param query_params [Hash, nil] Query parameters to match
  # @param expected [Integer] Expected number of requests
  def verify_request_count(test_id:, method:, url_path:, expected:, query_params: nil)
    uri = URI("#{WIREMOCK_ADMIN_URL}/requests/find")
    http = Net::HTTP.new(uri.host, uri.port)
    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })

    request_body = { "method" => method, "urlPath" => url_path }
    request_body["headers"] = { "X-Test-Id" => { "equalTo" => test_id } }
    request_body["queryParameters"] = query_params.transform_values { |v| { "equalTo" => v } } if query_params

    post_request.body = request_body.to_json
    response = http.request(post_request)
    result = JSON.parse(response.body)
    requests = result["requests"] || []

    assert_equal expected, requests.length, "Expected #{expected} requests, found #{requests.length}"
  end
end
