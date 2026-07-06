# frozen_string_literal: true

require_relative "wiremock_test_case"

class IdentifiersWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(base_url: WIREMOCK_BASE_URL)
  end

  def test_identifiers_update_with_wiremock
    test_id = "identifiers.update.0"

    @client.identifiers.update(
      id_type_path_param: "phone",
      id_type: "phone",
      old_value: "+13175556789",
      new_value: "+13175556798",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "identifiers.update.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "PATCH",
      url_path: "/identifiers/phone",
      query_params: nil,
      expected: 1
    )
  end

  def test_identifiers_patch_metadata_with_wiremock
    test_id = "identifiers.patch_metadata.0"

    @client.identifiers.patch_metadata(
      id_type_path_param: "phone",
      label: "primary",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "identifiers.patch_metadata.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "PATCH",
      url_path: "/identifiers/phone/metadata",
      query_params: nil,
      expected: 1
    )
  end
end
