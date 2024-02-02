# frozen_string_literal: true

require_relative "types/create_movie_request"
require_relative "types/movie"
require_relative "types/movie_id"
require "async"

module SeedApiClient
  module Imdb
    class ImdbClient
      attr_reader :request_client

      # @param request_client [RequestClient]
      # @return [Imdb::ImdbClient]
      def initialize(request_client:)
        # @type [RequestClient]
        @request_client = request_client
      end

      # @param request [Hash] Request of type Imdb::CreateMovieRequest, as a Hash
      #   * :title (String)
      #   * :rating (Float)
      # @param request_options [RequestOptions]
      # @return [Imdb::MOVIE_ID]
      def create_movie(request:, request_options: nil)
        @request_client.conn.post("/movies/create-movie") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
          req.body = { **request, **request_options&.additional_body_parameters }.compact
        end
      end

      # @param movie_id [Imdb::MOVIE_ID]
      # @param request_options [RequestOptions]
      # @return [Imdb::Movie]
      def get_movie(movie_id:, request_options: nil)
        response = @request_client.conn.get("/movies/#{movie_id}") do |req|
          req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
          req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
          req.headers = { **req.headers, **request_options&.additional_headers }.compact
        end
        Imdb::Movie.from_json(json_object: response)
      end
    end

    class AsyncImdbClient
      attr_reader :request_client

      # @param request_client [AsyncRequestClient]
      # @return [Imdb::AsyncImdbClient]
      def initialize(request_client:)
        # @type [AsyncRequestClient]
        @request_client = request_client
      end

      # @param request [Hash] Request of type Imdb::CreateMovieRequest, as a Hash
      #   * :title (String)
      #   * :rating (Float)
      # @param request_options [RequestOptions]
      # @return [Imdb::MOVIE_ID]
      def create_movie(request:, request_options: nil)
        Async.call do
          response = @request_client.conn.post("/movies/create-movie") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
            req.body = { **request, **request_options&.additional_body_parameters }.compact
          end
          response
        end
      end

      # @param movie_id [Imdb::MOVIE_ID]
      # @param request_options [RequestOptions]
      # @return [Imdb::Movie]
      def get_movie(movie_id:, request_options: nil)
        Async.call do
          response = @request_client.conn.get("/movies/#{movie_id}") do |req|
            req.options.timeout = request_options.timeout_in_seconds unless request_options.timeout_in_seconds.nil?
            req.headers["Authorization"] = @request_client.token if @request_client.token.nil?
            req.headers = { **req.headers, **request_options&.additional_headers }.compact
          end
          Imdb::Movie.from_json(json_object: response)
        end
      end
    end
  end
end
