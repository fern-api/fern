# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsContainerWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_container_get_and_return_list_of_primitives_with_wiremock
    test_id = "endpoints.container.get_and_return_list_of_primitives.0"

    @client.endpoints.container.get_and_return_list_of_primitives(
      request: %w[string string],
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.container.get_and_return_list_of_primitives.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/list-of-primitives",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_list_of_objects_with_wiremock
    test_id = "endpoints.container.get_and_return_list_of_objects.0"

    @client.endpoints.container.get_and_return_list_of_objects(
      request: [{
        string: "string"
      }, {
        string: "string"
      }],
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.container.get_and_return_list_of_objects.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/list-of-objects",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_set_of_primitives_with_wiremock
    test_id = "endpoints.container.get_and_return_set_of_primitives.0"

    @client.endpoints.container.get_and_return_set_of_primitives(
      request: Set.new(["string"]),
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.container.get_and_return_set_of_primitives.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/set-of-primitives",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_set_of_objects_with_wiremock
    test_id = "endpoints.container.get_and_return_set_of_objects.0"

    @client.endpoints.container.get_and_return_set_of_objects(
      request: Set.new([{
                         string: "string"
                       }]),
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.container.get_and_return_set_of_objects.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/set-of-objects",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_map_prim_to_prim_with_wiremock
    test_id = "endpoints.container.get_and_return_map_prim_to_prim.0"

    @client.endpoints.container.get_and_return_map_prim_to_prim(
      request: {
        string: "string"
      },
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.container.get_and_return_map_prim_to_prim.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/map-prim-to-prim",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_map_of_prim_to_object_with_wiremock
    test_id = "endpoints.container.get_and_return_map_of_prim_to_object.0"

    @client.endpoints.container.get_and_return_map_of_prim_to_object(
      request: {
        string: {
          string: "string"
        }
      },
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.container.get_and_return_map_of_prim_to_object.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/map-prim-to-object",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_container_get_and_return_optional_with_wiremock
    test_id = "endpoints.container.get_and_return_optional.0"

    @client.endpoints.container.get_and_return_optional(
      request: {
        string: "string"
      },
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.container.get_and_return_optional.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/container/opt-objects",
      query_params: nil,
      expected: 1
    )
  end
end
