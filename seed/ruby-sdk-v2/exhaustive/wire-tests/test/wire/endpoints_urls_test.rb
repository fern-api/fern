# frozen_string_literal: true

require_relative "wiremock_test_case"

class EndpointsUrlsWireTest < WireMockTestCase
  def setup
    super

    @client = FernExhaustive::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_endpoints_urls_with_mixed_case_with_wiremock
    test_id = "endpoints.urls.with_mixed_case.0"

    @client.endpoints.urls.with_mixed_case(request_options: {
                                             additional_headers: {
                                               "X-Test-Id" => "endpoints.urls.with_mixed_case.0"
                                             }
                                           })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/urls/MixedCase",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_urls_no_ending_slash_with_wiremock
    test_id = "endpoints.urls.no_ending_slash.0"

    @client.endpoints.urls.no_ending_slash(request_options: {
                                             additional_headers: {
                                               "X-Test-Id" => "endpoints.urls.no_ending_slash.0"
                                             }
                                           })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/urls/no-ending-slash",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_urls_with_ending_slash_with_wiremock
    test_id = "endpoints.urls.with_ending_slash.0"

    @client.endpoints.urls.with_ending_slash(request_options: {
                                               additional_headers: {
                                                 "X-Test-Id" => "endpoints.urls.with_ending_slash.0"
                                               }
                                             })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/urls/with-ending-slash/",
      query_params: nil,
      expected: 1
    )
  end

  def test_endpoints_urls_with_underscores_with_wiremock
    test_id = "endpoints.urls.with_underscores.0"

    @client.endpoints.urls.with_underscores(request_options: {
                                              additional_headers: {
                                                "X-Test-Id" => "endpoints.urls.with_underscores.0"
                                              }
                                            })

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/urls/with_underscores",
      query_params: nil,
      expected: 1
    )
  end
end
