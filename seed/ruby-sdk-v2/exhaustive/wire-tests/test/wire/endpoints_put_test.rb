# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsPutWireTest < WireMockTestCase
  def setup
    super

    @client = FernExhaustive::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_put_add_with_wiremock
    test_id = "endpoints.put.add.0"

    @client.endpoints.put.add(
      id: "id",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.put.add.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "PUT",
      url_path: "/id",
      query_params: nil,
      expected: 1
    )
  end
end
