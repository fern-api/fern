# frozen_string_literal: true

require_relative "wiremock_test_case"

class BasicauthWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      username: "test-username",
      password: "test-password",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_basicauth_getwithbasicauth_with_wiremock
    test_id = "basicauth.getwithbasicauth.0"

    @client.basicauth.getwithbasicauth(request_options: {
                                         additional_headers: {
                                           "X-Test-Id" => "basicauth.getwithbasicauth.0"
                                         }
                                       })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/basic-auth",
      query_params: nil,
      expected: 1
    )

    verify_authorization_header(
      test_id: test_id,
      method: "GET",
      url_path: "/basic-auth",
      expected_value: "Basic dGVzdC11c2VybmFtZTp0ZXN0LXBhc3N3b3Jk"
    )
  end

  def test_basicauth_postwithbasicauth_with_wiremock
    test_id = "basicauth.postwithbasicauth.0"

    @client.basicauth.postwithbasicauth(request_options: {
                                          additional_headers: {
                                            "X-Test-Id" => "basicauth.postwithbasicauth.0"
                                          }
                                        })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/basic-auth",
      query_params: nil,
      expected: 1
    )

    verify_authorization_header(
      test_id: test_id,
      method: "POST",
      url_path: "/basic-auth",
      expected_value: "Basic dGVzdC11c2VybmFtZTp0ZXN0LXBhc3N3b3Jk"
    )
  end
end
