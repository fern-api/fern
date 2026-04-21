# frozen_string_literal: true

require_relative "wiremock_test_case"

class BasicAuthWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      username: "test-username",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_basic_auth_get_with_basic_auth_with_wiremock
    test_id = "basic_auth.get_with_basic_auth.0"

    @client.basic_auth.get_with_basic_auth(request_options: {
      additional_headers: {
        "X-Test-Id" => "basic_auth.get_with_basic_auth.0"
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
      expected_value: "Basic dGVzdC11c2VybmFtZTo="
    )
  end

  def test_basic_auth_post_with_basic_auth_with_wiremock
    test_id = "basic_auth.post_with_basic_auth.0"

    @client.basic_auth.post_with_basic_auth(request_options: {
      additional_headers: {
        "X-Test-Id" => "basic_auth.post_with_basic_auth.0"
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
      expected_value: "Basic dGVzdC11c2VybmFtZTo="
    )
  end
end
