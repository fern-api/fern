# frozen_string_literal: true

require_relative "wiremock_test_case"

class NoAuthWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL,
      max_retries: 0
    )
  end

  def test_no_auth_post_with_no_auth_with_wiremock
    test_id = "no_auth.post_with_no_auth.0"

    @client.no_auth.post_with_no_auth(
      request: {
        key: "value"
      },
      request_options: {
        additional_headers: {
          "X-Test-Id" => "no_auth.post_with_no_auth.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/no-auth",
      query_params: nil,
      expected: 1
    )
  end

  def test_no_auth_post_with_no_auth_throws_bad_request_body_with_wiremock
    test_id = "no_auth.post_with_no_auth.1"

    error = assert_raises(Seed::Errors::ClientError) do
      @client.no_auth.post_with_no_auth(
        request: {
          key: "value"
        },
        request_options: {
          additional_headers: {
            "X-Test-Id" => "no_auth.post_with_no_auth.1"
          }
        }
      )
    end

    assert_equal 400, error.code
    assert_equal JSON.parse('{"message":"message"}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/no-auth",
      query_params: nil,
      expected: 1
    )
  end
end
