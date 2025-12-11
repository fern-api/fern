# frozen_string_literal: true

require_relative "wire_helper"
require "net/http"
require "json"
require "uri"
require "seed"

class EndpointsHttpMethodsWireTest < Minitest::Test
  WIREMOCK_BASE_URL = "http://localhost:8080"
  WIREMOCK_ADMIN_URL = "http://localhost:8080/__admin"

  def setup
    super
    return if ENV["RUN_WIRE_TESTS"] == "true"

    skip "Wire tests are disabled by default. Set RUN_WIRE_TESTS=true to enable them."
  end

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

  def test_endpoints_http_methods_test_get_with_wiremock
    test_id = "endpoints.http_methods.test_get.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.http_methods.test_get(
      id: "id",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.http_methods.test_get.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/http-methods/id",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_http_methods_test_post_with_wiremock
    test_id = "endpoints.http_methods.test_post.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.http_methods.test_post(
      string: "string",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.http_methods.test_post.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/http-methods",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_http_methods_test_put_with_wiremock
    test_id = "endpoints.http_methods.test_put.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.http_methods.test_put(
      id: "id",
      string: "string",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.http_methods.test_put.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "PUT",
      url_path: "/http-methods/id",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_http_methods_test_patch_with_wiremock
    test_id = "endpoints.http_methods.test_patch.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.http_methods.test_patch(
      id: "id",
      string: "string",
      integer: 1,
      long: 1_000_000,
      double: 1.1,
      bool: true,
      datetime: "2024-01-15T09:30:00Z",
      date: "2023-01-15",
      uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
      base_64: "SGVsbG8gd29ybGQh",
      list: %w[list list],
      set: Set.new(["set"]),
      map: {
        1 => "map"
      },
      bigint: "1000000",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.http_methods.test_patch.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "PATCH",
      url_path: "/http-methods/id",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_http_methods_test_delete_with_wiremock
    test_id = "endpoints.http_methods.test_delete.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.http_methods.test_delete(
      id: "id",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.http_methods.test_delete.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "DELETE",
      url_path: "/http-methods/id",
      query_params: nil,
      expected: 1
    )
  end
end
