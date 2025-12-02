# frozen_string_literal: true

require "test_helper"
require "net/http"
require "json"
require "uri"
require "seed"

class EndpointsUrlsWireTest < Minitest::Test
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

  def test_endpoints_urls_with_mixed_case_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.urls.with_mixed_case

    verify_request_count(
      method: "GET",
      url_path: "/urls/MixedCase",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_urls_no_ending_slash_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.urls.no_ending_slash

    verify_request_count(
      method: "GET",
      url_path: "/urls/no-ending-slash",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_urls_with_ending_slash_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.urls.with_ending_slash

    verify_request_count(
      method: "GET",
      url_path: "/urls/with-ending-slash/",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_urls_with_underscores_with_wiremock
    reset_wiremock_requests

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.urls.with_underscores

    verify_request_count(
      method: "GET",
      url_path: "/urls/with_underscores",
      query_params: nil,
      expected: 1
    )
  end
end
