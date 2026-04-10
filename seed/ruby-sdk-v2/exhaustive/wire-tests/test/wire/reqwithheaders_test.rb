# frozen_string_literal: true

require_relative "wiremock_test_case"

class ReqwithheadersWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_reqwithheaders_getwithcustomheader_with_wiremock
    test_id = "reqwithheaders.getwithcustomheader.0"

    @client.reqwithheaders.getwithcustomheader(
      test_endpoint_header: "X-TEST-ENDPOINT-HEADER",
      body: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "reqwithheaders.getwithcustomheader.0"
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
