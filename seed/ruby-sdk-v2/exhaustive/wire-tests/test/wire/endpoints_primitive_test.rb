# frozen_string_literal: true

require "test_helper"
require "net/http"
require "json"
require "uri"
require "seed"

class EndpointsPrimitiveWireTest < Minitest::Test
  WIREMOCK_BASE_URL = "http://localhost:8080"
  WIREMOCK_ADMIN_URL = "http://localhost:8080/__admin"

  def setup
    super
    return if ENV["RUN_WIRE_TESTS"] == "true"

    skip "Wire tests are disabled by default. Set RUN_WIRE_TESTS=true to enable them."
  end

  def reset_wiremock_requests
    uri = URI("#{WIREMOCK_ADMIN_URL}/requests")
    http = Net::HTTP.new(uri.host, uri.port)
    request = Net::HTTP::Delete.new(uri.path, { "Content-Type" => "application/json" })
    http.request(request)
  end

  def verify_request_count(method:, url_path:, expected:, query_params: nil)
    uri = URI("#{WIREMOCK_ADMIN_URL}/requests/find")
    http = Net::HTTP.new(uri.host, uri.port)
    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })

    request_body = { "method" => method, "urlPath" => url_path }
    request_body["queryParameters"] = query_params.transform_values { |v| { "equalTo" => v } } if query_params

    post_request.body = request_body.to_json
    response = http.request(post_request)
    result = JSON.parse(response.body)
    requests = result["requests"] || []

    assert_equal expected, requests.length, "Expected #{expected} requests, found #{requests.length}"
  end

  def test_endpoints_primitive_get_and_return_string_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_string

    verify_request_count(
      method: "POST",
      url_path: "/primitive/string",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_int_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_int

    verify_request_count(
      method: "POST",
      url_path: "/primitive/integer",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_long_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_long

    verify_request_count(
      method: "POST",
      url_path: "/primitive/long",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_double_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_double

    verify_request_count(
      method: "POST",
      url_path: "/primitive/double",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_bool_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_bool

    verify_request_count(
      method: "POST",
      url_path: "/primitive/boolean",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_datetime_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_datetime

    verify_request_count(
      method: "POST",
      url_path: "/primitive/datetime",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_date_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_date

    verify_request_count(
      method: "POST",
      url_path: "/primitive/date",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_uuid_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_uuid

    verify_request_count(
      method: "POST",
      url_path: "/primitive/uuid",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_base_64_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_base_64

    verify_request_count(
      method: "POST",
      url_path: "/primitive/base64",
      query_params: nil,
      expected: 1
    )
  end
end
