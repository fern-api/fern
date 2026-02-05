# frozen_string_literal: true

require_relative "wiremock_test_case"

class ReqWithHeadersWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_req_with_headers_get_with_custom_header_with_wiremock
    test_id = "req_with_headers.get_with_custom_header.0"

    @client.req_with_headers.get_with_custom_header(
      x_test_service_header: "X-TEST-SERVICE-HEADER",
      x_test_endpoint_header: "X-TEST-ENDPOINT-HEADER",
      body: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "req_with_headers.get_with_custom_header.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/test-headers/custom-header",
      query_params: nil,
      expected: 1
    )
  end
end
