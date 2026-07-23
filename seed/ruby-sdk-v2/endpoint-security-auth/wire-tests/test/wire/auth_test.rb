# frozen_string_literal: true

require_relative "wiremock_test_case"

class AuthWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      api_key: "test-api-key",
      client_id: "test-client-id",
      client_secret: "test-client-secret",
      username: "test-username",
      password: "test-password",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_auth_get_token_with_wiremock
    test_id = "auth.get_token.0"

    @client.auth.get_token(
      client_id: "client_id",
      client_secret: "client_secret",
      audience: "https://api.example.com",
      grant_type: "client_credentials",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "auth.get_token.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/token",
      query_params: nil,
      expected: 1
    )

    verify_auth_headers(
      test_id: test_id,
      method: "POST",
      url_path: "/token",
      matchers: [
        { name: "Authorization", kind: "absent" },
        { name: "X-API-Key", kind: "absent" }
      ]
    )
  end
end
