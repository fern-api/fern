# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsContentTypeWireTest < WireMockTestCase
  def setup
    super

    @client = FernExhaustive::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_content_type_post_json_patch_content_type_with_wiremock
    test_id = "endpoints.content_type.post_json_patch_content_type.0"

    @client.endpoints.content_type.post_json_patch_content_type(
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
          "X-Test-Id" => "endpoints.content_type.post_json_patch_content_type.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo/bar",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_content_type_post_json_patch_content_with_charset_type_with_wiremock
    test_id = "endpoints.content_type.post_json_patch_content_with_charset_type.0"

    @client.endpoints.content_type.post_json_patch_content_with_charset_type(
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
          "X-Test-Id" => "endpoints.content_type.post_json_patch_content_with_charset_type.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo/baz",
      query_params: nil,
      expected: 1
    )
  end
end
