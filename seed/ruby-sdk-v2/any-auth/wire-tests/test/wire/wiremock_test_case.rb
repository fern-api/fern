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
  WIREMOCK_BASE_URL = (ENV.fetch("WIREMOCK_URL", nil) || "http://localhost:8080").freeze
  WIREMOCK_ADMIN_URL = "#{WIREMOCK_BASE_URL}/__admin".freeze

  def setup
    super
    skip "Wire tests are disabled by default. Set RUN_WIRE_TESTS=true to enable them." unless ENV["RUN_WIRE_TESTS"] == "true"
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

  # Verifies the JSON body of the request made to WireMock for the given test ID.
  #
  # @param test_id [String] The test ID used to filter requests
  # @param method [String] The HTTP method (GET, POST, etc.)
  # @param url_path [String] The URL path to match
  # @param expected_body [Object] The expected request body, as parsed JSON
  def verify_request_body(test_id:, method:, url_path:, expected_body:)
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

    refute_empty requests, "No requests found for test_id #{test_id} (#{method} #{url_path})"
    actual_body = JSON.parse(requests.first["body"])

    assert_equal expected_body, actual_body
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
    actual_header = requests.first.dig("headers", "Authorization")

    assert_equal expected_value, actual_header, "Expected Authorization header '#{expected_value}', got '#{actual_header}'"
  end

  # Verifies that numbers in the captured JSON request body equal the values passed to the SDK,
  # so a decimal that is truncated or rounded on the way out fails the test.
  #
  # @param test_id [String] The test ID used to filter requests
  # @param method [String] The HTTP method (GET, POST, etc.)
  # @param url_path [String] The URL path to match
  # @param expected [Hash{String => Numeric}] JSON Pointer (RFC 6901) => expected number
  def verify_request_body_numbers(test_id:, method:, url_path:, expected:)
    admin_url = ENV["WIREMOCK_URL"] ? "#{ENV["WIREMOCK_URL"]}/__admin" : WIREMOCK_ADMIN_URL
    uri = URI("#{admin_url}/requests/find")
    http = Net::HTTP.new(uri.host, uri.port)
    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })

    request_body = { "method" => method, "urlPath" => url_path }
    request_body["headers"] = { "X-Test-Id" => { "equalTo" => test_id } }

    post_request.body = request_body.to_json
    response = http.request(post_request)

    assert_equal "200", response.code, "WireMock request lookup failed for test_id #{test_id}: #{response.body}"
    requests = JSON.parse(response.body)["requests"] || []

    refute_empty requests, "No requests found for test_id #{test_id}"
    body = requests.first["body"]
    begin
      document = JSON.parse(body)
    rescue JSON::ParserError
      flunk "Expected a JSON request body for test_id #{test_id}, got #{body.inspect}"
    end

    assert_json_numbers(expected, document, "request body for test_id #{test_id}")
  end

  # Verifies that numbers in the mocked JSON response decode unchanged into the SDK result,
  # so a decimal that is truncated or rounded on the way in fails the test.
  #
  # @param actual [Object] The value returned by the SDK method
  # @param expected [Hash{String => Numeric}] JSON Pointer (RFC 6901) => expected number
  def verify_response_numbers(actual:, expected:)
    assert_json_numbers(expected, wire_json(actual), "response")
  end

  def assert_json_numbers(expected, document, label)
    expected.each do |pointer, value|
      actual = json_pointer_get(document, pointer)

      assert_kind_of Numeric, actual, "Expected a number at #{pointer} in #{label}, got #{actual.inspect}"
      assert_equal value, actual, "Expected #{value.inspect} at #{pointer} in #{label}, got #{actual.inspect}"
    end
  end

  def json_pointer_get(document, pointer)
    pointer.split("/", -1).drop(1).reduce(document) do |node, token|
      key = token.gsub(/~[01]/, "~0" => "~", "~1" => "/")
      case node
      when ::Array then node[Integer(key, 10)]
      when ::Hash then node[key]
      end
    end
  end

  def wire_json(value)
    case value
    when ::Array then value.map { |item| wire_json(item) }
    when ::Hash then value.to_h { |key, item| [key.to_s, wire_json(item)] }
    when nil, ::String, ::Numeric, true, false then value
    else value.respond_to?(:to_h) ? wire_json(value.to_h) : value
    end
  end
end
