# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsHttpMethodsWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_http_methods_test_get_with_wiremock
    test_id = "endpoints.http_methods.test_get.0"

    @client.endpoints.http_methods.test_get(
      id: "id",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.http_methods.test_get.0"
        }
      }
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

    @client.endpoints.http_methods.test_post(
      string: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.http_methods.test_post.0"
        }
      }
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

    @client.endpoints.http_methods.test_put(
      id: "id",
      string: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.http_methods.test_put.0"
        }
      }
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

    @client.endpoints.http_methods.test_patch(
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
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.http_methods.test_patch.0"
        }
      }
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

    @client.endpoints.http_methods.test_delete(
      id: "id",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.http_methods.test_delete.0"
        }
      }
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
