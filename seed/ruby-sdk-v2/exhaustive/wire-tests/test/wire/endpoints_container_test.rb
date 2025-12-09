# frozen_string_literal: true

require "test_helper"
require "net/http"
require "json"
require "uri"
require "seed"

class EndpointsContainerWireTest < Minitest::Test
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

  def test_endpoints_container_get_and_return_list_of_primitives_with_wiremock
    test_id = "endpoints.container.get_and_return_list_of_primitives.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.container.get_and_return_list_of_primitives(
      request: %w[string string],
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.container.get_and_return_list_of_primitives.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/list-of-primitives",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_list_of_objects_with_wiremock
    test_id = "endpoints.container.get_and_return_list_of_objects.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.container.get_and_return_list_of_objects(
      request: [{
        string: "string"
      }, {
        string: "string"
      }],
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.container.get_and_return_list_of_objects.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/list-of-objects",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_set_of_primitives_with_wiremock
    test_id = "endpoints.container.get_and_return_set_of_primitives.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.container.get_and_return_set_of_primitives(
      request: Set.new(["string"]),
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.container.get_and_return_set_of_primitives.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/set-of-primitives",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_set_of_objects_with_wiremock
    test_id = "endpoints.container.get_and_return_set_of_objects.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.container.get_and_return_set_of_objects(
      request: Set.new([{
                         string: "string"
                       }]),
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.container.get_and_return_set_of_objects.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/set-of-objects",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_map_prim_to_prim_with_wiremock
    test_id = "endpoints.container.get_and_return_map_prim_to_prim.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.container.get_and_return_map_prim_to_prim(
      request: {
        string: "string"
      },
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.container.get_and_return_map_prim_to_prim.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/map-prim-to-prim",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_map_of_prim_to_object_with_wiremock
    test_id = "endpoints.container.get_and_return_map_of_prim_to_object.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.container.get_and_return_map_of_prim_to_object(
      request: {
        string: {
          string: "string"
        }
      },
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.container.get_and_return_map_of_prim_to_object.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/map-prim-to-object",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_optional_with_wiremock
    test_id = "endpoints.container.get_and_return_optional.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.endpoints.container.get_and_return_optional(
      request: {
        string: "string"
      },
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "endpoints.container.get_and_return_optional.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/opt-objects",
      query_params: nil,
      expected: 1
    )
  end
end
