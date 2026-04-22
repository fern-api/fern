# frozen_string_literal: true

require "test_helper"
require_relative "wire_helper"
require "net/http"
require "json"
require "uri"
require "seed"

# Base test case for WireMock-based wire tests.
#
# This class provides helper methods for verifying requests made to WireMock
# and manages the test lifecycle for integration tests.
class WireMockTestCase < Minitest::Test
  WIREMOCK_BASE_URL = ENV["WIREMOCK_URL"] || "http://localhost:8080"
  WIREMOCK_ADMIN_URL = "#{WIREMOCK_BASE_URL}/__admin".freeze

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
    admin_url = ENV["WIREMOCK_URL"] ? "#{ENV["WIREMOCK_URL"]}/__admin" : WIREMOCK_ADMIN_URL
    uri = URI("#{admin_url}/requests/find")
    http = Net::HTTP.new(uri.host, uri.port)
    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })

    request_body = { "method" => method, "urlPath" => url_path }
    request_body["headers"] = { "X-Test-Id" => { "equalTo" => test_id } }
    if query_params
      request_body["queryParameters"] = query_params.transform_values do |v|
        if v.is_a?(Array)
          { "hasExactly" => v.map { |item| { "equalTo" => item } } }
        else
          { "equalTo" => v }
        end
      end
    end

    post_request.body = request_body.to_json
    response = http.request(post_request)
    result = JSON.parse(response.body)
    requests = result["requests"] || []

    assert_equal expected, requests.length, "Expected #{expected} requests, found #{requests.length}"
  end

  # Verifies that the Authorization header on captured requests matches the expected value.
  #
  # @param test_id [String] The test ID used to filter requests
  # @param method [String] The HTTP method (GET, POST, etc.)
  # @param url_path [String] The URL path to match
  # @param expected_value [String] The expected Authorization header value
  def verify_authorization_header(test_id:, method:, url_path:, expected_value:)
    admin_url = ENV["WIREMOCK_URL"] ? "#{ENV["WIREMOCK_URL"]}/__admin" : WIREMOCK_ADMIN_URL
    uri = URI("#{admin_url}/requests/find")
    http = Net::HTTP.new(uri.host, uri.port)
    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })

    request_body = { "method" => method, "urlPath" => url_path }
    request_body["headers"] = { "X-Test-Id" => { "equalTo" => test_id } }

    post_request.body = request_body.to_json
    response = http.request(post_request)
    result = JSON.parse(response.body)
    requests = result["requests"] || []

    refute_empty requests, "No requests found for test_id #{test_id}"
    actual_header = requests.first.dig("request", "headers", "Authorization")

    assert_equal expected_value, actual_header, "Expected Authorization header '#{expected_value}', got '#{actual_header}'"
  end
end
