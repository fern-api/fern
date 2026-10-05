# frozen_string_literal: true

require_relative "wiremock_test_case"

class InlinedRequestsWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::MyClient.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL,
      max_retries: 0
    )
  end

  def test_inlined_requests_post_with_object_bodyand_response_with_wiremock
    test_id = "inlined_requests.post_with_object_bodyand_response.0"

    @client.inlined_requests.post_with_object_bodyand_response(
      string: "string",
      integer: 1,
      nested_object: {
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: "2024-01-15T09:30:00Z",
        date: "2023-01-15",
        uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        base64: "SGVsbG8gd29ybGQh",
        list: %w[list list],
        set: Set.new(["set"]),
        map: {
          1 => "map"
        },
        bigint: "1000000"
      },
      request_options: {
        additional_headers: {
          "X-Test-Id" => "inlined_requests.post_with_object_bodyand_response.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/req-bodies/object",
      query_params: nil,
      expected: 1
    )
  end

  def test_inlined_requests_post_with_object_bodyand_response_throws_bad_request_body_with_wiremock
    test_id = "inlined_requests.post_with_object_bodyand_response.1"

    error = assert_raises(Seed::Errors::ClientError) do
      @client.inlined_requests.post_with_object_bodyand_response(
        string: "string",
        integer: 1,
        nested_object: {
          string: "string",
          integer: 1,
          long: 1000000,
          double: 1.1,
          bool: true,
          datetime: "2024-01-15T09:30:00Z",
          date: "2023-01-15",
          uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
          base64: "SGVsbG8gd29ybGQh",
          list: %w[list list],
          set: Set.new(["set"]),
          map: {
            1 => "map"
          },
          bigint: "1000000"
        },
        request_options: {
          additional_headers: {
            "X-Test-Id" => "inlined_requests.post_with_object_bodyand_response.1"
          }
        }
      )
    end

    assert_equal 400, error.code
    assert_equal JSON.parse('{"message":"message"}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/req-bodies/object",
      query_params: nil,
      expected: 1
    )
  end

  def test_inlined_requests_post_with_array_body_and_headers_with_wiremock
    test_id = "inlined_requests.post_with_array_body_and_headers.0"

    @client.inlined_requests.post_with_array_body_and_headers(
      x_custom_header: "X-Custom-Header",
      body: %w[string string],
      request_options: {
        additional_headers: {
          "X-Test-Id" => "inlined_requests.post_with_array_body_and_headers.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/req-bodies/array-body-with-headers",
      query_params: nil,
      expected: 1
    )
  end
end
