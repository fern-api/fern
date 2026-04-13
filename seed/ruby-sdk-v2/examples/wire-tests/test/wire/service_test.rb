# frozen_string_literal: true

require_relative "wiremock_test_case"

class ServiceWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(
      token: "<token>",
      base_url: WIREMOCK_BASE_URL
    )
  end

  def test_service_getmovie_with_wiremock
    test_id = "service.getmovie.0"

    @client.service.getmovie(
      movie_id: "movieId",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "service.getmovie.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/movie/movieId",
      query_params: nil,
      expected: 1
    )
  end

  def test_service_createmovie_with_wiremock
    test_id = "service.createmovie.0"

    @client.service.createmovie(
      id: "id",
      title: "title",
      from: "from",
      rating: 1.1,
      type: "movie",
      tag: "tag",
      metadata: {},
      revenue: 1_000_000,
      request_options: {
        additional_headers: {
          "X-Test-Id" => "service.createmovie.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/movie",
      query_params: nil,
      expected: 1
    )
  end

  def test_service_getmetadata_with_wiremock
    test_id = "service.getmetadata.0"

    @client.service.getmetadata(
      api_version: "X-API-Version",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "service.getmetadata.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/metadata",
      query_params: nil,
      expected: 1
    )
  end

  def test_service_createbigentity_with_wiremock
    test_id = "service.createbigentity.0"

    @client.service.createbigentity(request_options: {
                                      additional_headers: {
                                        "X-Test-Id" => "service.createbigentity.0"
                                      }
                                    })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/big-entity",
      query_params: nil,
      expected: 1
    )
  end

  def test_service_refreshtoken_with_wiremock
    test_id = "service.refreshtoken.0"

    @client.service.refreshtoken(
      ttl: 1,
      request_options: {
        additional_headers: {
          "X-Test-Id" => "service.refreshtoken.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/refresh-token",
      query_params: nil,
      expected: 1
    )
  end
end
