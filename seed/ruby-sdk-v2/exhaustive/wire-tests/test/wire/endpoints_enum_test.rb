# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsEnumWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_enum_get_and_return_enum_with_wiremock
    test_id = "endpoints.enum.get_and_return_enum.0"

    @client.endpoints.enum.get_and_return_enum(
      request: "SUNNY",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.enum.get_and_return_enum.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/enum",
      query_params: nil,
      expected: 1
    )
  end
end
