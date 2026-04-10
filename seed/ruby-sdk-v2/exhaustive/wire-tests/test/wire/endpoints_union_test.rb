# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsUnionWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_union_endpoints_union_get_and_return_union_with_wiremock
    test_id = "endpoints_union.endpoints_union_get_and_return_union.0"

    @client.endpoints_union.endpoints_union_get_and_return_union(
      name: "name",
      likes_to_woof: true,
      animal: "dog",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints_union.endpoints_union_get_and_return_union.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/union",
      query_params: nil,
      expected: 1
    )
  end
end
