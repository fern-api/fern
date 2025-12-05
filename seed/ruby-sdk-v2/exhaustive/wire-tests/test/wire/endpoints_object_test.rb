# frozen_string_literal: true

require "test_helper"
require "net/http"
require "json"
require "uri"
require "seed"

class EndpointsObjectWireTest < Minitest::Test
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

  def test_endpoints_object_get_and_return_with_optional_field_with_wiremock
    test_id = "endpoints.object.get_and_return_with_optional_field.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.object.get_and_return_with_optional_field(
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
                           "X-Test-Id" => "endpoints.object.get_and_return_with_optional_field.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-with-optional-field",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_with_required_field_with_wiremock
    test_id = "endpoints.object.get_and_return_with_required_field.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.object.get_and_return_with_required_field(
      string: "string",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.object.get_and_return_with_required_field.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-with-required-field",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_with_map_of_map_with_wiremock
    test_id = "endpoints.object.get_and_return_with_map_of_map.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.object.get_and_return_with_map_of_map(
      map: {
        map: {
          map: "map"
        }
      },
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.object.get_and_return_with_map_of_map.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-with-map-of-map",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_nested_with_optional_field_with_wiremock
    test_id = "endpoints.object.get_and_return_nested_with_optional_field.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.object.get_and_return_nested_with_optional_field(
      string: "string",
      nested_object: {
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
        bigint: "1000000"
      },
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.object.get_and_return_nested_with_optional_field.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-nested-with-optional-field",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_nested_with_required_field_with_wiremock
    test_id = "endpoints.object.get_and_return_nested_with_required_field.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.object.get_and_return_nested_with_required_field(
      string: "string",
      string: "string",
      nested_object: {
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
        bigint: "1000000"
      },
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.object.get_and_return_nested_with_required_field.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-nested-with-required-field/string",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_nested_with_required_field_as_list_with_wiremock
    test_id = "endpoints.object.get_and_return_nested_with_required_field_as_list.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.object.get_and_return_nested_with_required_field_as_list(request_options: { base_url: WIREMOCK_BASE_URL,
                                                                                                 additional_headers: {
                                                                                                   "X-Test-Id" => "endpoints.object.get_and_return_nested_with_required_field_as_list.0"
                                                                                                 } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-nested-with-required-field-list",
      query_params: nil,
      expected: 1
    )
  end
end
