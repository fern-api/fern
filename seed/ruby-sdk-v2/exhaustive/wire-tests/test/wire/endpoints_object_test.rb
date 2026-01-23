# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsObjectWireTest < WireMockTestCase
  def setup
    super

    @client = FernExhaustive::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_object_get_and_return_with_optional_field_with_wiremock
    test_id = "endpoints.object.get_and_return_with_optional_field.0"

    @client.endpoints.object.get_and_return_with_optional_field(
      string: "string",
      integer: 1,
      long: 1_000_000,
      double: 1.1,
      bool: true,
      datetime: "2024-01-15T09:30:00Z",
      date: "2023-01-15",
      uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
      base_64: "SGVsbG8gd29ybGQh",
      list: %w[list list],
      set: Set.new(["set"]),
      map: {
        1 => "map"
      },
      bigint: "1000000",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.object.get_and_return_with_optional_field.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-with-optional-field",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_with_required_field_with_wiremock
    test_id = "endpoints.object.get_and_return_with_required_field.0"

    @client.endpoints.object.get_and_return_with_required_field(
      string: "string",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.object.get_and_return_with_required_field.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-with-required-field",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_with_map_of_map_with_wiremock
    test_id = "endpoints.object.get_and_return_with_map_of_map.0"

    @client.endpoints.object.get_and_return_with_map_of_map(
      map: {
        map: {
          map: "map"
        }
      },
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.object.get_and_return_with_map_of_map.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-with-map-of-map",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_nested_with_optional_field_with_wiremock
    test_id = "endpoints.object.get_and_return_nested_with_optional_field.0"

    @client.endpoints.object.get_and_return_nested_with_optional_field(
      string: "string",
      nested_object: {
        string: "string",
        integer: 1,
        long: 1_000_000,
        double: 1.1,
        bool: true,
        datetime: "2024-01-15T09:30:00Z",
        date: "2023-01-15",
        uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        base_64: "SGVsbG8gd29ybGQh",
        list: %w[list list],
        set: Set.new(["set"]),
        map: {
          1 => "map"
        },
        bigint: "1000000"
      },
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.object.get_and_return_nested_with_optional_field.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-nested-with-optional-field",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_nested_with_required_field_with_wiremock
    test_id = "endpoints.object.get_and_return_nested_with_required_field.0"

    @client.endpoints.object.get_and_return_nested_with_required_field(
      string: "string",
      string: "string",
      nested_object: {
        string: "string",
        integer: 1,
        long: 1_000_000,
        double: 1.1,
        bool: true,
        datetime: "2024-01-15T09:30:00Z",
        date: "2023-01-15",
        uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        base_64: "SGVsbG8gd29ybGQh",
        list: %w[list list],
        set: Set.new(["set"]),
        map: {
          1 => "map"
        },
        bigint: "1000000"
      },
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.object.get_and_return_nested_with_required_field.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-nested-with-required-field/string",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_object_get_and_return_nested_with_required_field_as_list_with_wiremock
    test_id = "endpoints.object.get_and_return_nested_with_required_field_as_list.0"

    @client.endpoints.object.get_and_return_nested_with_required_field_as_list(
      request: [{
        string: "string",
        nested_object: {
          string: "string",
          integer: 1,
          long: 1_000_000,
          double: 1.1,
          bool: true,
          datetime: "2024-01-15T09:30:00Z",
          date: "2023-01-15",
          uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
          base_64: "SGVsbG8gd29ybGQh",
          list: %w[list list],
          set: Set.new(["set"]),
          map: {
            1 => "map"
          },
          bigint: "1000000"
        }
      }, {
        string: "string",
        nested_object: {
          string: "string",
          integer: 1,
          long: 1_000_000,
          double: 1.1,
          bool: true,
          datetime: "2024-01-15T09:30:00Z",
          date: "2023-01-15",
          uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
          base_64: "SGVsbG8gd29ybGQh",
          list: %w[list list],
          set: Set.new(["set"]),
          map: {
            1 => "map"
          },
          bigint: "1000000"
        }
      }],
      request_options: {
        additional_headers: {
          "X-Test-Id" => "endpoints.object.get_and_return_nested_with_required_field_as_list.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/object/get-and-return-nested-with-required-field-list",
      query_params: nil,
      expected: 1
    )
  end
end
