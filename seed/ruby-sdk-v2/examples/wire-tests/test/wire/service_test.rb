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

  def test_service_get_movie_with_wiremock
    test_id = "service.get_movie.0"

    @client.service.get_movie(
      movie_id: "movie-c06a4ad7",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "service.get_movie.0"
        }
      }
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

    @client.service.create_movie(
      id: "movie-c06a4ad7",
      prequel: "movie-cv9b914f",
      title: "The Boy and the Heron",
      from: "Hayao Miyazaki",
      rating: 8,
      type: "movie",
      tag: "tag-wf9as23d",
      metadata: {},
      revenue: 1_000_000,
      request_options: {
        additional_headers: {
          "X-Test-Id" => "service.create_movie.0"
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

  def test_service_get_metadata_with_wiremock
    test_id = "service.get_metadata.0"

    @client.service.get_metadata(
      shallow: false,
      x_api_version: "0.0.1",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "service.get_metadata.0"
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

  def test_service_create_big_entity_with_wiremock
    test_id = "service.create_big_entity.0"

    @client.service.create_big_entity(
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
        name: "name"
      },
      common_metadata: {
        id: "id",
        data: {
          data: "data"
        },
        json_string: "jsonString"
      },
      migration: {
        name: "name"
      },
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
      request_options: {
        additional_headers: {
          "X-Test-Id" => "service.create_big_entity.0"
        }
      }
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

    @client.service.refresh_token(request_options: {
                                    additional_headers: {
                                      "X-Test-Id" => "service.refresh_token.0"
                                    }
                                  })

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/refresh-token",
      query_params: nil,
      expected: 1
    )
  end
end
