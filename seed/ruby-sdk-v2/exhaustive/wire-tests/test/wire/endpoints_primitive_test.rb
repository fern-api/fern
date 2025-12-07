# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsPrimitiveWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_primitive_get_and_return_string_with_wiremock
    test_id = "endpoints.primitive.get_and_return_string.0"

    @client.endpoints.primitive.get_and_return_string(request_options: {
                                                        additional_headers: {
                                                          "X-Test-Id" => "endpoints.primitive.get_and_return_string.0"
                                                        }
                                                      })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/string",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_int_with_wiremock
    test_id = "endpoints.primitive.get_and_return_int.0"

    @client.endpoints.primitive.get_and_return_int(request_options: {
                                                     additional_headers: {
                                                       "X-Test-Id" => "endpoints.primitive.get_and_return_int.0"
                                                     }
                                                   })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/integer",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_long_with_wiremock
    test_id = "endpoints.primitive.get_and_return_long.0"

    @client.endpoints.primitive.get_and_return_long(request_options: {
                                                      additional_headers: {
                                                        "X-Test-Id" => "endpoints.primitive.get_and_return_long.0"
                                                      }
                                                    })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/long",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_double_with_wiremock
    test_id = "endpoints.primitive.get_and_return_double.0"

    @client.endpoints.primitive.get_and_return_double(request_options: {
                                                        additional_headers: {
                                                          "X-Test-Id" => "endpoints.primitive.get_and_return_double.0"
                                                        }
                                                      })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/double",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_bool_with_wiremock
    test_id = "endpoints.primitive.get_and_return_bool.0"

    @client.endpoints.primitive.get_and_return_bool(request_options: {
                                                      additional_headers: {
                                                        "X-Test-Id" => "endpoints.primitive.get_and_return_bool.0"
                                                      }
                                                    })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/boolean",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_datetime_with_wiremock
    test_id = "endpoints.primitive.get_and_return_datetime.0"

    @client.endpoints.primitive.get_and_return_datetime(request_options: {
                                                          additional_headers: {
                                                            "X-Test-Id" => "endpoints.primitive.get_and_return_datetime.0"
                                                          }
                                                        })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/datetime",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_date_with_wiremock
    test_id = "endpoints.primitive.get_and_return_date.0"

    @client.endpoints.primitive.get_and_return_date(request_options: {
                                                      additional_headers: {
                                                        "X-Test-Id" => "endpoints.primitive.get_and_return_date.0"
                                                      }
                                                    })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/date",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_uuid_with_wiremock
    test_id = "endpoints.primitive.get_and_return_uuid.0"

    @client.endpoints.primitive.get_and_return_uuid(request_options: {
                                                      additional_headers: {
                                                        "X-Test-Id" => "endpoints.primitive.get_and_return_uuid.0"
                                                      }
                                                    })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/uuid",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_primitive_get_and_return_base_64_with_wiremock
    test_id = "endpoints.primitive.get_and_return_base_64.0"

    @client.endpoints.primitive.get_and_return_base_64(request_options: {
                                                         additional_headers: {
                                                           "X-Test-Id" => "endpoints.primitive.get_and_return_base_64.0"
                                                         }
                                                       })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/primitive/base64",
      query_params: nil,
      expected: 1
    )
  end
end
