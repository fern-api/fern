# frozen_string_literal: true

require_relative "wiremock_test_case"

class InlinedrequestsWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_inlinedrequests_postwithobjectbodyandresponse_with_wiremock
    test_id = "inlinedrequests.postwithobjectbodyandresponse.0"

    @client.inlinedrequests.postwithobjectbodyandresponse(
      string: "string",
      integer: 1,
      nested_object: {},
      request_options: {
        additional_headers: {
          "X-Test-Id" => "inlinedrequests.postwithobjectbodyandresponse.0"
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
