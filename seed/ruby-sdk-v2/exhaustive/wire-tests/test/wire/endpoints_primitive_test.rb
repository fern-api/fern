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

  def test_endpoints_primitive_get_and_return_string_with_wiremock
    test_id = "endpoints.primitive.get_and_return_string.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_string(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                        additional_headers: {
                                                                          "X-Test-Id" => "endpoints.primitive.get_and_return_string.0"
                                                                        } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/string",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_int_with_wiremock
    test_id = "endpoints.primitive.get_and_return_int.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_int(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                     additional_headers: {
                                                                       "X-Test-Id" => "endpoints.primitive.get_and_return_int.0"
                                                                     } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/integer",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_long_with_wiremock
    test_id = "endpoints.primitive.get_and_return_long.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_long(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                      additional_headers: {
                                                                        "X-Test-Id" => "endpoints.primitive.get_and_return_long.0"
                                                                      } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/long",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_double_with_wiremock
    test_id = "endpoints.primitive.get_and_return_double.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_double(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                        additional_headers: {
                                                                          "X-Test-Id" => "endpoints.primitive.get_and_return_double.0"
                                                                        } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/double",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_bool_with_wiremock
    test_id = "endpoints.primitive.get_and_return_bool.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_bool(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                      additional_headers: {
                                                                        "X-Test-Id" => "endpoints.primitive.get_and_return_bool.0"
                                                                      } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/boolean",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_datetime_with_wiremock
    test_id = "endpoints.primitive.get_and_return_datetime.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_datetime(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                          additional_headers: {
                                                                            "X-Test-Id" => "endpoints.primitive.get_and_return_datetime.0"
                                                                          } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/datetime",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_date_with_wiremock
    test_id = "endpoints.primitive.get_and_return_date.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_date(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                      additional_headers: {
                                                                        "X-Test-Id" => "endpoints.primitive.get_and_return_date.0"
                                                                      } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/date",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_uuid_with_wiremock
    test_id = "endpoints.primitive.get_and_return_uuid.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_uuid(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                      additional_headers: {
                                                                        "X-Test-Id" => "endpoints.primitive.get_and_return_uuid.0"
                                                                      } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/uuid",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_base_64_with_wiremock
    test_id = "endpoints.primitive.get_and_return_base_64.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.primitive.get_and_return_base_64(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                         additional_headers: {
                                                                           "X-Test-Id" => "endpoints.primitive.get_and_return_base_64.0"
                                                                         } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/base64",
      query_params: nil,
      expected: 1
    )
  end
end
