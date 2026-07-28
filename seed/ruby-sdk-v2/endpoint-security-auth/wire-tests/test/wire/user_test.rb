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

  def test_user_get_with_bearer_with_wiremock
    test_id = "user.get_with_bearer.0"

    @client.user.get_with_bearer(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get_with_bearer.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      query_params: nil,
      expected: 1
    )

    verify_auth_headers(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      matchers: [
        { name: "Authorization", kind: "exact", value: "Bearer <token>" },
        { name: "X-API-Key", kind: "absent" }
      ]
    )
  end

  def test_user_get_with_api_key_with_wiremock
    test_id = "user.get_with_api_key.0"

    @client.user.get_with_api_key(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get_with_api_key.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      query_params: nil,
      expected: 1
    )

    verify_auth_headers(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      matchers: [
        { name: "X-API-Key", kind: "exact", value: "test-api-key" },
        { name: "Authorization", kind: "absent" }
      ]
    )
  end

  def test_user_get_with_o_auth_with_wiremock
    test_id = "user.get_with_o_auth.0"

    @client.user.get_with_o_auth(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get_with_o_auth.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      query_params: nil,
      expected: 1
    )

    verify_auth_headers(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      matchers: [
        { name: "Authorization", kind: "present" },
        { name: "X-API-Key", kind: "absent" }
      ]
    )
  end

  def test_user_get_with_basic_with_wiremock
    test_id = "user.get_with_basic.0"

    @client.user.get_with_basic(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get_with_basic.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      query_params: nil,
      expected: 1
    )

    verify_auth_headers(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      matchers: [
        { name: "Authorization", kind: "exact", value: "Basic dGVzdC11c2VybmFtZTp0ZXN0LXBhc3N3b3Jk" },
        { name: "X-API-Key", kind: "absent" }
      ]
    )
  end

  def test_user_get_with_inferred_auth_with_wiremock
    test_id = "user.get_with_inferred_auth.0"

    @client.user.get_with_inferred_auth(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get_with_inferred_auth.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      query_params: nil,
      expected: 1
    )

    verify_auth_headers(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      matchers: [
        { name: "Authorization", kind: "present" },
        { name: "X-API-Key", kind: "absent" }
      ]
    )
  end

  def test_user_get_with_any_auth_with_wiremock
    test_id = "user.get_with_any_auth.0"

    @client.user.get_with_any_auth(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get_with_any_auth.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      query_params: nil,
      expected: 1
    )

    verify_auth_headers(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      matchers: [
        { name: "Authorization", kind: "exact", value: "Bearer <token>" },
        { name: "X-API-Key", kind: "absent" }
      ]
    )
  end

  def test_user_get_with_all_auth_with_wiremock
    test_id = "user.get_with_all_auth.0"

    @client.user.get_with_all_auth(request_options: {
      additional_headers: {
        "X-Test-Id" => "user.get_with_all_auth.0"
      }
    })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      query_params: nil,
      expected: 1
    )

    verify_auth_headers(
      test_id: test_id,
      method: "GET",
      url_path: "/users",
      matchers: [
        { name: "Authorization", kind: "present" },
        { name: "X-API-Key", kind: "exact", value: "test-api-key" }
      ]
    )
  end
end
