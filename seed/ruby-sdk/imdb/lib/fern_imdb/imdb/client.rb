# frozen_string_literal: true

require_relative "../../requests"
require_relative "types/create_movie_request"
require_relative "types/movie_id"
require_relative "types/movie"
require "async"

module SeedApiClient
  class ImdbClient
    attr_reader :request_client

    # @param request_client [RequestClient]
    # @return [ImdbClient]
    def initialize(request_client:)
      # @type [RequestClient]
      @request_client = request_client
    end

    # Add a movie to the database
    #
    # @param request [Hash] Request of type Imdb::CreateMovieRequest, as a Hash
    #   * :movie_title (String)
    #   * :movie_rating (Float)
    # @param request_options [RequestOptions]
    # @return [Imdb::MOVIE_ID]
    def create_movie(request:, request_options: nil)
      response = @request_client.conn.post("/movies/create-movie") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
      end
      response.body
    end

    # @param movie_id [Imdb::MOVIE_ID]
    # @param request_options [RequestOptions]
    # @return [Imdb::Movie]
    def get_movie(movie_id:, request_options: nil)
      response = @request_client.conn.get("/movies/#{movie_id}") do |req|
        req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
        req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
        req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
      end
      Imdb::Movie.from_json(json_object: response.body)
    end
  end

  class AsyncImdbClient
    attr_reader :request_client

    # @param request_client [AsyncRequestClient]
    # @return [AsyncImdbClient]
    def initialize(request_client:)
      # @type [AsyncRequestClient]
      @request_client = request_client
    end

    # Add a movie to the database
    #
    # @param request [Hash] Request of type Imdb::CreateMovieRequest, as a Hash
    #   * :movie_title (String)
    #   * :movie_rating (Float)
    # @param request_options [RequestOptions]
    # @return [Imdb::MOVIE_ID]
    def create_movie(request:, request_options: nil)
      Async do
        response = @request_client.conn.post("/movies/create-movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
          req.body = { **(request || {}), **(request_options&.additional_body_parameters || {}) }.compact
        end
        response.body
      end
    end

    # @param movie_id [Imdb::MOVIE_ID]
    # @param request_options [RequestOptions]
    # @return [Imdb::Movie]
    def get_movie(movie_id:, request_options: nil)
      Async do
        response = @request_client.conn.get("/movies/#{movie_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options&.timeout_in_seconds.nil?
          req.headers["Authorization"] = request_options.token unless request_options&.token.nil?
          req.headers = { **req.headers, **(request_options&.additional_headers || {}) }.compact
        end
        Imdb::Movie.from_json(json_object: response.body)
      end
    end
  end
end
