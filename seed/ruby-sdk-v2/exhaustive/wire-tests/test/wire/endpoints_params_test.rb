# frozen_string_literal: true

require_relative "wire_helper"
require "net/http"
require "json"
require "uri"
require "seed"

class EndpointsParamsWireTest < Minitest::Test
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

  def test_endpoints_params_get_with_path_with_wiremock
    test_id = "endpoints.params.get_with_path.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.params.get_with_path(
      param: "param",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.params.get_with_path.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/params/path/param",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_params_get_with_inline_path_with_wiremock
    test_id = "endpoints.params.get_with_inline_path.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.params.get_with_path(
      param: "param",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.params.get_with_inline_path.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/params/path/param",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_params_get_with_query_with_wiremock
    test_id = "endpoints.params.get_with_query.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.params.get_with_query(
      query: "query",
      number: 1,
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.params.get_with_query.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/params",
      query_params: { "query" => "query", "number" => "1" },
      expected: 1
    )
  end

  def test_endpoints_params_get_with_allow_multiple_query_with_wiremock
    test_id = "endpoints.params.get_with_allow_multiple_query.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.params.get_with_query(
      query: "query",
      number: 1,
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.params.get_with_allow_multiple_query.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/params",
      query_params: { "query" => "query", "number" => "1" },
      expected: 1
    )
  end

  def test_endpoints_params_get_with_path_and_query_with_wiremock
    test_id = "endpoints.params.get_with_path_and_query.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.params.get_with_path_and_query(
      param: "param",
      query: "query",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.params.get_with_path_and_query.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/params/path-query/param",
      query_params: { "query" => "query" },
      expected: 1
    )
  end

  def test_endpoints_params_get_with_inline_path_and_query_with_wiremock
    test_id = "endpoints.params.get_with_inline_path_and_query.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.params.get_with_path_and_query(
      param: "param",
      query: "query",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.params.get_with_inline_path_and_query.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/params/path-query/param",
      query_params: { "query" => "query" },
      expected: 1
    )
  end

  def test_endpoints_params_modify_with_path_with_wiremock
    test_id = "endpoints.params.modify_with_path.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.params.modify_with_path(
      param: "param",
      request: "string",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.params.modify_with_path.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "PUT",
      url_path: "/params/path/param",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_params_modify_with_inline_path_with_wiremock
    test_id = "endpoints.params.modify_with_inline_path.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.params.modify_with_path(
      param: "param",
      request: "string",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.params.modify_with_inline_path.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "PUT",
      url_path: "/params/path/param",
      query_params: nil,
      expected: 1
    )
  end
end
