# frozen_string_literal: true

require "test_helper"
require "net/http"
require "json"
require "uri"
require "seed"

class EndpointsEnumWireTest < Minitest::Test
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

  def test_endpoints_enum_get_and_return_enum_with_wiremock
    test_id = "endpoints.enum.get_and_return_enum.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.enum.get_and_return_enum(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                 additional_headers: {
                                                                   "X-Test-Id" => "endpoints.enum.get_and_return_enum.0"
                                                                 } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/enum",
      query_params: nil,
      expected: 1
    )
  end
end
