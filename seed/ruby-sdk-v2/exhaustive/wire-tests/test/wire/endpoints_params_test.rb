# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsParamsWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_params_get_with_path_with_wiremock
    test_id = "endpoints.params.get_with_path.0"

    @client.endpoints.params.get_with_path(
      param: "param",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.params.get_with_path.0"
        }
      }
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

    @client.endpoints.params.get_with_path(
      param: "param",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.params.get_with_inline_path.0"
        }
      }
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

    @client.endpoints.params.get_with_query(
      query: "query",
      number: 1,
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.params.get_with_query.0"
        }
      }
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

    @client.endpoints.params.get_with_query(
      query: "query",
      number: 1,
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.params.get_with_allow_multiple_query.0"
        }
      }
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

    @client.endpoints.params.get_with_path_and_query(
      param: "param",
      query: "query",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.params.get_with_path_and_query.0"
        }
      }
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

    @client.endpoints.params.get_with_path_and_query(
      param: "param",
      query: "query",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.params.get_with_inline_path_and_query.0"
        }
      }
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

    @client.endpoints.params.modify_with_path(
      param: "param",
      request: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.params.modify_with_path.0"
        }
      }
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

    @client.endpoints.params.modify_with_path(
      param: "param",
      request: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.params.modify_with_inline_path.0"
        }
      }
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
