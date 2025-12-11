# frozen_string_literal: true

require_relative "wiremock_test_case"

class FileNotificationServiceWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_file_notification_service_get_exception_with_wiremock
    test_id = "file.notification.service.get_exception.0"

    @client.file.notification.service.get_exception(
      notification_id: "notification-hsy129x",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "file.notification.service.get_exception.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/file/notification/notification-hsy129x",
      query_params: nil,
      expected: 1
    )
  end
end
