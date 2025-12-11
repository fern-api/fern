# frozen_string_literal: true

require_relative "wire_helper"
require "net/http"
require "json"
require "uri"
require "seed"

class ServiceWireTest < Minitest::Test
  WIREMOCK_BASE_URL = "http://localhost:8080"
  WIREMOCK_ADMIN_URL = "http://localhost:8080/__admin"

  def setup
    super
    return if ENV["RUN_WIRE_TESTS"] == "true"

    skip "Wire tests are disabled by default. Set RUN_WIRE_TESTS=true to enable them."
  end

  def verify_request_count(test_id:, method:, url_path:, expected:, query_params: nil)
    uri = URI("#{WIREMOCK_ADMIN_URL}/requests/find")
    http = Net::HTTP.new(uri.host, uri.port)
    post_request = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })

    request_body = { "method" => method, "urlPath" => url_path }
    request_body["headers"] = { "X-Test-Id" => { "equalTo" => test_id } }
    request_body["queryParameters"] = query_params.transform_values { |v| { "equalTo" => v } } if query_params

    post_request.body = request_body.to_json
    response = http.request(post_request)
    result = JSON.parse(response.body)
    requests = result["requests"] || []

    assert_equal expected, requests.length, "Expected #{expected} requests, found #{requests.length}"
  end

  def test_service_get_movie_with_wiremock
    test_id = "service.get_movie.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.service.get_movie(
      movie_id: "movie-c06a4ad7",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "service.get_movie.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/movie/movie-c06a4ad7",
      query_params: nil,
      expected: 1
    )
  end

  def test_service_create_movie_with_wiremock
    test_id = "service.create_movie.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.service.create_movie(
      id: "movie-c06a4ad7",
      prequel: "movie-cv9b914f",
      title: "The Boy and the Heron",
      from: "Hayao Miyazaki",
      rating: 8,
      type: "movie",
      tag: "tag-wf9as23d",
      metadata: {},
      revenue: 1_000_000,
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "service.create_movie.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/movie",
      query_params: nil,
      expected: 1
    )
  end

  def test_service_get_metadata_with_wiremock
    test_id = "service.get_metadata.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.service.get_metadata(
      shallow: false,
      x_api_version: "0.0.1",
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "service.get_metadata.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "GET",
      url_path: "/metadata",
      query_params: nil,
      expected: 1
    )
  end

  def test_service_create_big_entity_with_wiremock
    test_id = "service.create_big_entity.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.service.create_big_entity(
      cast_member: {
        name: "name",
        id: "id"
      },
      extended_movie: {
        cast: %w[cast cast],
        id: "id",
        prequel: "prequel",
        title: "title",
        from: "from",
        rating: 1.1,
        type: "movie",
        tag: "tag",
        book: "book",
        metadata: {},
        revenue: 1_000_000
      },
      entity: {
        type: "primitive",
        name: "name"
      },
      metadata: {},
      common_metadata: {
        id: "id",
        data: {
          data: "data"
        },
        json_string: "jsonString"
      },
      data: {},
      migration: {
        name: "name",
        status: "RUNNING"
      },
      test: {},
      node: {
        name: "name",
        nodes: [{
          name: "name",
          nodes: [{
            name: "name",
            nodes: [],
            trees: []
          }, {
            name: "name",
            nodes: [],
            trees: []
          }],
          trees: [{
            nodes: []
          }, {
            nodes: []
          }]
        }, {
          name: "name",
          nodes: [{
            name: "name",
            nodes: [],
            trees: []
          }, {
            name: "name",
            nodes: [],
            trees: []
          }],
          trees: [{
            nodes: []
          }, {
            nodes: []
          }]
        }],
        trees: [{
          nodes: [{
            name: "name",
            nodes: [],
            trees: []
          }, {
            name: "name",
            nodes: [],
            trees: []
          }]
        }, {
          nodes: [{
            name: "name",
            nodes: [],
            trees: []
          }, {
            name: "name",
            nodes: [],
            trees: []
          }]
        }]
      },
      directory: {
        name: "name",
        files: [{
          name: "name",
          contents: "contents"
        }, {
          name: "name",
          contents: "contents"
        }],
        directories: [{
          name: "name",
          files: [{
            name: "name",
            contents: "contents"
          }, {
            name: "name",
            contents: "contents"
          }],
          directories: [{
            name: "name",
            files: [],
            directories: []
          }, {
            name: "name",
            files: [],
            directories: []
          }]
        }, {
          name: "name",
          files: [{
            name: "name",
            contents: "contents"
          }, {
            name: "name",
            contents: "contents"
          }],
          directories: [{
            name: "name",
            files: [],
            directories: []
          }, {
            name: "name",
            files: [],
            directories: []
          }]
        }]
      },
      moment: {
        id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        date: "2023-01-15",
        datetime: "2024-01-15T09:30:00Z"
      },
      request_options: { base_url: WIREMOCK_BASE_URL,
                         additional_headers: {
                           "X-Test-Id" => "service.create_big_entity.0"
                         } }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/big-entity",
      query_params: nil,
      expected: 1
    )
  end

  def test_service_refresh_token_with_wiremock
    test_id = "service.refresh_token.0"

    require "seed"
    client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, token: "<token>")
    client.service.refresh_token(request_options: { base_url: WIREMOCK_BASE_URL,
                                                    additional_headers: {
                                                      "X-Test-Id" => "service.refresh_token.0"
                                                    } })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/refresh-token",
      query_params: nil,
      expected: 1
    )
  end
end
