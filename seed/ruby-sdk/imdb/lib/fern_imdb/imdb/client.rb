# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/create_movie_request"
require_relative "types/movie_id"
require_relative "types/movie"
require "async"

module SeedApiClient
  class ImdbClient
    attr_reader :request_client

    # @param request_client [SeedApiClient::RequestClient]
    # @return [SeedApiClient::ImdbClient]
    def initialize(request_client:)
      # @type [SeedApiClient::RequestClient]
      @request_client = request_client
    end

    # Add a movie to the database
    #
    # @param request [Hash] Request of type SeedApiClient::Imdb::CreateMovieRequest, as a Hash
    #   * :title (String)
    #   * :rating (Float)
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::Imdb::MOVIE_ID]
    def create_movie(request:, request_options: nil)
      response = @request_client.conn.post("/movies/create-movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movies/create-movie"
      end
      response.body
    end

    # @param movie_id [SeedApiClient::Imdb::MOVIE_ID]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::Imdb::Movie]
    def get_movie(movie_id:, request_options: nil)
      response = @request_client.conn.get("/movies/#{movie_id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.url "#{@request_client.get_url(request_options: request_options)}/movies/#{movie_id}"
      end
      SeedApiClient::Imdb::Movie.from_json(json_object: response.body)
    end
  end

  class AsyncImdbClient
    attr_reader :request_client

    # @param request_client [SeedApiClient::AsyncRequestClient]
    # @return [SeedApiClient::AsyncImdbClient]
    def initialize(request_client:)
      # @type [SeedApiClient::AsyncRequestClient]
      @request_client = request_client
    end

    # Add a movie to the database
    #
    # @param request [Hash] Request of type SeedApiClient::Imdb::CreateMovieRequest, as a Hash
    #   * :title (String)
    #   * :rating (Float)
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::Imdb::MOVIE_ID]
    def create_movie(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movies/create-movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movies/create-movie"
        end
        response.body
      end
    end

    # @param movie_id [SeedApiClient::Imdb::MOVIE_ID]
    # @param request_options [SeedApiClient::RequestOptions]
    # @return [SeedApiClient::Imdb::Movie]
    def get_movie(movie_id:, request_options: nil)
      Async do
        response = @request_client.conn.get("/movies/#{movie_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.url "#{@request_client.get_url(request_options: request_options)}/movies/#{movie_id}"
        end
        SeedApiClient::Imdb::Movie.from_json(json_object: response.body)
      end
    end
  end
end
