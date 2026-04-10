# frozen_string_literal: true

require_relative "wiremock_test_case"

class HealthServiceWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_health_service_check_with_wiremock
    test_id = "health.service.check.0"

    @client.health.service.check(
      id: "id-2sdx82h",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "health.service.check.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/check/id-2sdx82h",
      query_params: nil,
      expected: 1
    )
  end

  def test_health_service_ping_with_wiremock
    test_id = "health.service.ping.0"

    @client.health.service.ping(request_options: {
                                  additional_headers: {
                                    "X-Test-Id" => "health.service.ping.0"
                                  }
                                })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/ping",
      query_params: nil,
      expected: 1
    )
  end
end
