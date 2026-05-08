# frozen_string_literal: true

require_relative "wiremock_test_case"

class InlinedRequestsWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_inlined_requests_post_with_object_bodyand_response_with_wiremock
    test_id = "inlined_requests.post_with_object_bodyand_response.0"

    @client.inlined_requests.post_with_object_bodyand_response(
      string: "string",
      integer: 1,
      nested_object: {},
      request_options: {
        additional_headers: {
          "X-Test-Id" => "inlined_requests.post_with_object_bodyand_response.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/req-bodies/object",
      query_params: nil,
      expected: 1
    )
  end
end
