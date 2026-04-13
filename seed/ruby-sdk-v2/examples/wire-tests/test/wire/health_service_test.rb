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

  def test_health_service_health_service_check_with_wiremock
    test_id = "health_service.health_service_check.0"

    @client.health_service.health_service_check(
      id: "id",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "health_service.health_service_check.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/check/id",
      query_params: nil,
      expected: 1
    )
  end

  def test_health_service_health_service_ping_with_wiremock
    test_id = "health_service.health_service_ping.0"

    @client.health_service.health_service_ping(request_options: {
                                                 additional_headers: {
                                                   "X-Test-Id" => "health_service.health_service_ping.0"
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
