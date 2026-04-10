# frozen_string_literal: true

require_relative "wiremock_test_case"

class NoauthWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_noauth_postwithnoauth_with_wiremock
    test_id = "noauth.postwithnoauth.0"

    @client.noauth.postwithnoauth(request_options: {
                                    additional_headers: {
                                      "X-Test-Id" => "noauth.postwithnoauth.0"
                                    }
                                  })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/no-auth",
      query_params: nil,
      expected: 1
    )
  end
end
