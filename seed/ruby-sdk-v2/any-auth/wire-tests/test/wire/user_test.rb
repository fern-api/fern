# frozen_string_literal: true

require_relative "wiremock_test_case"

class UserWireTest < WireMockTestCase
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

  def test_user_get_with_wiremock
    test_id = "user.get.0"

    @client.user.get(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/users",
      query_params: nil,
      expected: 1
    )
  end

  def test_user_get_admins_with_wiremock
    test_id = "user.get_admins.0"

    @client.user.get_admins(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get_admins.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/admins",
      query_params: nil,
      expected: 1
    )
  end
end
