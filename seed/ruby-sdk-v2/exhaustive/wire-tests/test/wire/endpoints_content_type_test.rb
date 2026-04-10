# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsContentTypeWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_content_type_endpoints_content_type_post_json_patch_content_type_with_wiremock
    test_id = "endpoints_content_type.endpoints_content_type_post_json_patch_content_type.0"

    @client.endpoints_content_type.endpoints_content_type_post_json_patch_content_type(request_options: {
                                                                                         additional_headers: {
                                                                                           "X-Test-Id" => "endpoints_content_type.endpoints_content_type_post_json_patch_content_type.0"
                                                                                         }
                                                                                       })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo/bar",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_content_type_endpoints_content_type_post_json_patch_content_with_charset_type_with_wiremock
    test_id = "endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type.0"

    @client.endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type(request_options: {
                                                                                                      additional_headers: {
                                                                                                        "X-Test-Id" => "endpoints_content_type.endpoints_content_type_post_json_patch_content_with_charset_type.0"
                                                                                                      }
                                                                                                    })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo/baz",
      query_params: nil,
      expected: 1
    )
  end
end
