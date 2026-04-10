# frozen_string_literal: true

require_relative "wiremock_test_case"

class FileServiceWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_file_service_file_service_get_file_with_wiremock
    test_id = "file_service.file_service_get_file.0"

    @client.file_service.file_service_get_file(
      filename: "filename",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "file_service.file_service_get_file.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/file/filename",
      query_params: nil,
      expected: 1
    )
  end
end
