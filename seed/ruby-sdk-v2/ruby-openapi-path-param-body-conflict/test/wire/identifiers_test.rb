# frozen_string_literal: true

require_relative "wiremock_test_case"

class IdentifiersWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      username: "test-username",
      password: "test-password",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_identifiers_update_profile_identifier_with_wiremock
    test_id = "identifiers.update_profile_identifier.0"

    @client.identifiers.update_profile_identifier(
      store_id: "mem_store_00000000000000000000000000",
      profile_id: "mem_profile_00000000000000000000000000",
      id_type_path_param: "email",
      id_type: "phone",
      old_value: "+13175556789",
      new_value: "+13175556798",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "identifiers.update_profile_identifier.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "PATCH",
      url_path: "/Stores/mem_store_00000000000000000000000000/Profiles/mem_profile_00000000000000000000000000/Identifiers/email",
      query_params: nil,
      expected: 1
    )

    verify_authorization_header(
      test_id: test_id,
      method: "PATCH",
      url_path: "/Stores/mem_store_00000000000000000000000000/Profiles/mem_profile_00000000000000000000000000/Identifiers/email",
      expected_value: "Basic dGVzdC11c2VybmFtZTp0ZXN0LXBhc3N3b3Jk"
    )
  end
end
