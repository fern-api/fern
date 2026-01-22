# frozen_string_literal: true

require_relative "wiremock_test_case"

class NoReqBodyWireTest < WireMockTestCase
  def setup
    super

    @client = FernExhaustive::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_no_req_body_get_with_no_request_body_with_wiremock
    test_id = "no_req_body.get_with_no_request_body.0"

    @client.no_req_body.get_with_no_request_body(request_options: {
                                                   additional_headers: {
                                                     "X-Test-Id" => "no_req_body.get_with_no_request_body.0"
                                                   }
                                                 })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/no-req-body",
      query_params: nil,
      expected: 1
    )
  end

  def test_no_req_body_post_with_no_request_body_with_wiremock
    test_id = "no_req_body.post_with_no_request_body.0"

    @client.no_req_body.post_with_no_request_body(request_options: {
                                                    additional_headers: {
                                                      "X-Test-Id" => "no_req_body.post_with_no_request_body.0"
                                                    }
                                                  })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/no-req-body",
      query_params: nil,
      expected: 1
    )
  end
end
