# frozen_string_literal: true

require "test_helper"
require "net/http"
require "json"

class ImdbWireMockTest < Minitest::Test
  def reset_wiremock_requests
    wiremock_admin_url = "http://localhost:8080/__admin"
    uri = URI("#{wiremock_admin_url}/requests/reset")
    Net::HTTP.post(uri, nil, { "Content-Type" => "application/json" })
  end

  def verify_request_count(method, url_path, query_params, expected)
    wiremock_admin_url = "http://localhost:8080/__admin"
    uri = URI("#{wiremock_admin_url}/requests/find")

    request_body = {
      "method" => method,
      "urlPath" => url_path
    }

    if query_params && !query_params.empty?
      request_body["queryParameters"] = query_params.transform_values { |v| { "equalTo" => v } }
    end

    response = Net::HTTP.post(uri, request_body.to_json, { "Content-Type" => "application/json" })
    result = JSON.parse(response.body)

    assert_equal expected, result["requests"].length
  end

  def test_create_movie_with_wiremock
    reset_wiremock_requests
    wiremock_base_url = "http://localhost:8080"

    client = Seed::Client.new(base_url: wiremock_base_url, token: "<token>")

    client.imdb.create_movie(
      title: "title",
      rating: 1.1
    )

    verify_request_count("POST", "/movies/create-movie", nil, 1)
  end

  def test_get_movie_with_wiremock
    reset_wiremock_requests
    wiremock_base_url = "http://localhost:8080"

    client = Seed::Client.new(base_url: wiremock_base_url, token: "<token>")

    client.imdb.get_movie(movieId: "movieId")

    verify_request_count("GET", "/movies/movieId", nil, 1)
  end
end
