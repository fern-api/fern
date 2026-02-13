# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsPaginationWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_pagination_list_items_with_wiremock
    test_id = "endpoints.pagination.list_items.0"

    result = @client.endpoints.pagination.list_items(
      cursor: "cursor",
      limit: 1,
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.pagination.list_items.0"
        }
      }
    )

    result.pages.next_page

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/pagination",
      query_params: nil,
      expected: 1
    )
  end
end
