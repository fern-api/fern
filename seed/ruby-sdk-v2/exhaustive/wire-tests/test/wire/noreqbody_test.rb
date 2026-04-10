# frozen_string_literal: true

require_relative "wiremock_test_case"

class NoreqbodyWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_noreqbody_getwithnorequestbody_with_wiremock
    test_id = "noreqbody.getwithnorequestbody.0"

    @client.noreqbody.getwithnorequestbody(request_options: {
                                             additional_headers: {
                                               "X-Test-Id" => "noreqbody.getwithnorequestbody.0"
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

  def test_noreqbody_postwithnorequestbody_with_wiremock
    test_id = "noreqbody.postwithnorequestbody.0"

    @client.noreqbody.postwithnorequestbody(request_options: {
                                              additional_headers: {
                                                "X-Test-Id" => "noreqbody.postwithnorequestbody.0"
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
