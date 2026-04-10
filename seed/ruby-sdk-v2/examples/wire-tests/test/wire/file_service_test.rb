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

  def test_file_service_get_file_with_wiremock
    test_id = "file.service.get_file.0"

    @client.file.service.get_file(
      filename: "file.txt",
      x_file_api_version: "0.0.2",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "file.service.get_file.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/file/file.txt",
      query_params: nil,
      expected: 1
    )
  end
end
