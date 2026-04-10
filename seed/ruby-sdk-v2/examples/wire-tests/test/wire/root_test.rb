# frozen_string_literal: true

require_relative "wiremock_test_case"

class RootWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_root_echo_with_wiremock
    test_id = ".echo.0"

    @client..echo(
      request: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => ".echo.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/echo",
      query_params: nil,
      expected: 1
    )
  end

  def test_root_create_type_with_wiremock
    test_id = ".create_type.0"

    @client..create_type(
      request: "primitive",
      request_options: {
        additional_headers: {
          "X-Test-Id" => ".create_type.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/type",
      query_params: nil,
      expected: 1
    )
  end
end
