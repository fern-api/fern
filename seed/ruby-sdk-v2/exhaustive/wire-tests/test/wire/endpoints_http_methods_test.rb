# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsHttpMethodsWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_http_methods_endpoints_http_methods_test_get_with_wiremock
    test_id = "endpoints_http_methods.endpoints_http_methods_test_get.0"

    @client.endpoints_http_methods.endpoints_http_methods_test_get(
      id: "id",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints_http_methods.endpoints_http_methods_test_get.0"
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

  def test_endpoints_http_methods_endpoints_http_methods_test_put_with_wiremock
    test_id = "endpoints_http_methods.endpoints_http_methods_test_put.0"

    @client.endpoints_http_methods.endpoints_http_methods_test_put(
      id: "id",
      string: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints_http_methods.endpoints_http_methods_test_put.0"
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

  def test_endpoints_http_methods_endpoints_http_methods_test_delete_with_wiremock
    test_id = "endpoints_http_methods.endpoints_http_methods_test_delete.0"

    @client.endpoints_http_methods.endpoints_http_methods_test_delete(
      id: "id",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints_http_methods.endpoints_http_methods_test_delete.0"
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

  def test_endpoints_http_methods_endpoints_http_methods_test_patch_with_wiremock
    test_id = "endpoints_http_methods.endpoints_http_methods_test_patch.0"

    @client.endpoints_http_methods.endpoints_http_methods_test_patch(
      id: "id",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints_http_methods.endpoints_http_methods_test_patch.0"
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

  def test_endpoints_http_methods_endpoints_http_methods_test_post_with_wiremock
    test_id = "endpoints_http_methods.endpoints_http_methods_test_post.0"

    @client.endpoints_http_methods.endpoints_http_methods_test_post(
      string: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints_http_methods.endpoints_http_methods_test_post.0"
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
end
