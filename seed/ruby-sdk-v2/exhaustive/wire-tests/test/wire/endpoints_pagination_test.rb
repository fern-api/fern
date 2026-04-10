# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsPaginationWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_pagination_endpoints_pagination_list_items_with_wiremock
    test_id = "endpoints_pagination.endpoints_pagination_list_items.0"

    @client.endpoints_pagination.endpoints_pagination_list_items(request_options: {
                                                                   additional_headers: {
                                                                     "X-Test-Id" => "endpoints_pagination.endpoints_pagination_list_items.0"
                                                                   }
                                                                 })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/pagination",
      query_params: nil,
      expected: 1
    )
  end
end
